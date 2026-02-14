"use client";

import { useState, useRef, useMemo } from "react";
import { FolderOpen, Trash2, SearchX, FolderSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocalPostCard } from "@/components/local-post-card";
import LocalPaginationControls from "@/components/local-pagination";
import { toast } from "sonner";
import { LiteNavbar } from "@/components/lite-navbar";
import SplashScreen from "@/components/SplashScreen"; // ✅ Splash screen import

// --- Tauri Imports ---
import { open } from '@tauri-apps/plugin-dialog';
import { readDir, readFile } from '@tauri-apps/plugin-fs';

export default function Home() {
  // ✅ ALL HOOKS AT TOP - NEVER CONDITIONAL
  
  // Splash screen state
  const [showSplash, setShowSplash] = useState(true);
  
  // Global State for Search (Lifted for Navbar)
  const [searchQuery, setSearchQuery] = useState("");

  // Viewer State
  const [allPosts, setAllPosts] = useState<any[]>([]); 
  // 🚀 OPTIMIZATION: Store file PATHS instead of File objects
  const [imagesPathMap, setImagesPathMap] = useState<Map<string, string>>(new Map()); 
  const [imagesCache, setImagesCache] = useState<Map<string, File>>(new Map()); // Cache for loaded images
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  
  // Tags
  const [availableTags, setAvailableTags] = useState<Map<string, number>>(new Map());
  const [activeTag, setActiveTag] = useState("All"); 

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 12;
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🚀 NEW: Lazy load image when needed
  const loadImage = async (filename: string): Promise<File | null> => {
    // Check cache first
    if (imagesCache.has(filename)) {
      return imagesCache.get(filename)!;
    }

    // Get path from map
    const imagePath = imagesPathMap.get(filename);
    if (!imagePath) return null;

    try {
      // Read file on-demand
      const imageData = await readFile(imagePath);
      const ext = filename.toLowerCase().split('.').pop();
      const mimeType = ext === 'png' ? 'image/png' :
                       ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
                       ext === 'gif' ? 'image/gif' :
                       ext === 'webp' ? 'image/webp' : 'image/jpeg';
      
      const file = new File([imageData], filename, { type: mimeType });
      
      // Cache it
      setImagesCache(prev => new Map(prev).set(filename, file));
      
      return file;
    } catch (err) {
      console.error("Failed to load image:", filename, err);
      return null;
    }
  };

  // --- Helper: Recursive Directory Reader (OPTIMIZED) ---
  const processDirectoryRecursively = async (
    dirPath: string, 
    newImagesPathMap: Map<string, string>, 
    jsonFiles: { result: File | null, post: File | null, button: File | null },
    stats: { images: number, jsons: number }
  ) => {
    try {
        const entries = await readDir(dirPath);

        for (const entry of entries) {
            const fileName = entry.name;
            const fullPath = `${dirPath}/${fileName}`;
            
            if (entry.isDirectory) {
                // Recursively process subdirectories
                await processDirectoryRecursively(fullPath, newImagesPathMap, jsonFiles, stats);
            } else {
                const lowerName = fileName.toLowerCase();
                const isJson = lowerName.endsWith('.json');
                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(lowerName);

                if (isJson) {
                    // Read JSON files immediately (they're small)
                    const fileData = await readFile(fullPath);
                    const file = new File([fileData], fileName, { type: 'application/json' });
                    
                    if (lowerName === "result.json") {
                        jsonFiles.result = file;
                    }
                    else if (lowerName === "post.json" || lowerName === "posts.json") {
                        jsonFiles.post = file;
                    }
                    else if (lowerName === "button.json" || lowerName === "buttons.json") {
                        jsonFiles.button = file;
                    }
                    stats.jsons++;
                }
                else if (isImage) {
                    // 🚀 OPTIMIZATION: Store PATH only, don't read the image yet
                    newImagesPathMap.set(fileName, fullPath);
                    stats.images++;
                    
                    // Update UI every 100 images
                    if (stats.images % 100 === 0) {
                        setLoadingText(`Found ${stats.images} images...`);
                    }
                }
            }
        }
    } catch (err) {
        console.error("Error reading directory:", dirPath, err);
    }
  };

  // --- Tauri Folder Select Handler ---
  const handleTauriSelect = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Data Folder"
      });

      if (!selected) return;

      setLoadingText("Scanning folder...");
      const dirPath = selected as string;
      
      const newImagesPathMap = new Map<string, string>();
      let jsonFiles = { result: null as File | null, post: null as File | null, button: null as File | null };
      const stats = { images: 0, jsons: 0 };

      // 🚀 Fast scan - just catalog files, don't read images yet
      await processDirectoryRecursively(dirPath, newImagesPathMap, jsonFiles, stats);

      console.log(`✅ Cataloged ${stats.images} images, ${stats.jsons} JSON files`);
      setImagesPathMap(newImagesPathMap);
      setImagesCache(new Map()); // Clear cache

      if (jsonFiles.post && jsonFiles.button) {
          setLoadingText("Loading Neon DB Export...");
          await parseNeonDBExport(jsonFiles.post, jsonFiles.button);
      }
      else if (jsonFiles.result) {
          setLoadingText("Parsing Telegram JSON...");
          parseTelegramExport(jsonFiles.result);
      }
      else {
          toast.error("Required files not found!", {
              description: "Need 'result.json' OR ('Post.json' + 'Button.json')"
          });
          setLoadingText("");
      }

    } catch (err) {
      console.error("Tauri File Error:", err);
      toast.error("Failed to read folder via Tauri.");
      setLoadingText("");
    }
  };

  // --- PARSERS ---
  const parseTelegramExport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        let validPosts: any[] = [];

        if (jsonData.messages || (jsonData.name && jsonData.type === 'personal_chat')) {
            const messages = jsonData.messages || jsonData;
            validPosts = messages.filter((msg: any) => msg.photo).map((msg: any) => {
                const buttonsData: any[] = [];
                if (msg.inline_bot_buttons) {
                    for (const row of msg.inline_bot_buttons) {
                        for (const btn of row) {
                            const link = btn.url || btn.data;
                            if (link) buttonsData.push({ label: btn.text, url: link });
                        }
                    }
                }
                return { 
                    ...msg, 
                    buttons: buttonsData,
                    tagName: null,
                    searchableText: getCaptionFromEntity(msg.text) 
                };
            });
        }
        else if (Array.isArray(jsonData) && jsonData.length > 0 && jsonData[0].local_image) {
            validPosts = jsonData.map((item: any, index: number) => ({
                id: index, 
                date: item.date, 
                text: item.name, 
                photo: item.local_image, 
                buttons: item.links ? item.links.map((link: string, i: number) => ({
                    label: item.links.length === 1 ? "Open Link" : `Link ${i + 1}`,
                    url: link
                })) : [],
                tagName: null,
                searchableText: item.name || ""
            }));
        } 
        else {
             toast.error("Unknown JSON format.");
             setLoadingText("");
             return;
        }
        finalizeLoad(validPosts);
      } catch (err) {
        console.error(err);
        toast.error("Failed to parse result.json");
        setLoadingText("");
      }
    };
    reader.readAsText(file);
  };

  const parseNeonDBExport = async (postsFile: File | null, buttonsFile: File | null) => {
      if (!postsFile || !buttonsFile) return;
      try {
          const [postsText, buttonsText] = await Promise.all([
              postsFile.text(),
              buttonsFile.text()
          ]);
          const postsData = JSON.parse(postsText);
          const buttonsData = JSON.parse(buttonsText);

          const buttonsMap = new Map<string, any[]>();
          buttonsData.forEach((btn: any) => {
              if (!buttonsMap.has(btn.postId)) buttonsMap.set(btn.postId, []);
              buttonsMap.get(btn.postId)?.push({ label: btn.label, url: btn.url });
          });

          const validPosts = postsData.map((post: any) => ({
              id: post.id,
              date: post.originalDate, 
              text: post.caption, 
              photo: post.localPath, 
              buttons: buttonsMap.get(post.id) || [],
              tagName: post.tagName || null,
              searchableText: post.caption || ""
          }));
          finalizeLoad(validPosts);
      } catch (e) {
          console.error(e);
          toast.error("Failed to parse DB export files");
          setLoadingText("");
      }
  };

  const finalizeLoad = (posts: any[]) => {
      posts.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const tags = new Map<string, number>();
      posts.forEach(p => {
          if (p.tagName) {
              tags.set(p.tagName, (tags.get(p.tagName) || 0) + 1);
          }
      });

      setAllPosts(posts);
      setAvailableTags(tags);
      setIsLoaded(true);
      setLoadingText("");
      toast.success(`Loaded ${posts.length} posts instantly!`);
  };

  const getCaptionFromEntity = (textObj: any) => {
      if (typeof textObj === "string") return textObj;
      if (Array.isArray(textObj)) {
          return textObj.map((t: any) => (typeof t === "string" ? t : t.text)).join("");
      }
      return "";
  };

  const handleClear = () => {
    setAllPosts([]);
    setImagesPathMap(new Map());
    setImagesCache(new Map());
    setAvailableTags(new Map());
    setIsLoaded(false);
    setCurrentPage(1);
    setActiveTag("All");
    setSearchQuery(""); 
    if (fileInputRef.current) fileInputRef.current.value = ""; 
    toast.info("Local data cleared.");
  };

  // --- Filtering Logic ---
  const filteredPosts = useMemo(() => {
    let result = allPosts;

    if (activeTag && activeTag !== "All") {
        result = result.filter(post => post.tagName === activeTag);
    }

    if (searchQuery) {
        result = result.filter((post) => {
            const text = post.searchableText || "";
            return text.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }
    
    return result;
  }, [allPosts, searchQuery, activeTag]);

  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTag]);

  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / PER_PAGE);
  const displayPosts = filteredPosts.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  // ✅ CONDITIONAL RENDER AT END (AFTER ALL HOOKS)
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen pb-15 transition-colors">
      
      {/* 1. Navbar */}
      <LiteNavbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <div className="container mx-auto px-4 py-8">
        
        {/* 2. Sub-Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            
            {/* Left: Stats & Tags */}
            <div className="flex-1 min-w-0">
                {isLoaded ? (
                     <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide mask-fade">
                        <div className="shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 backdrop-blur-sm shadow-sm">
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Loaded</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{allPosts.length}</span>
                        </div>
                        {availableTags.size > 0 && (
                            <>
                                <div className="w-px h-6 bg-slate-200 dark:bg-zinc-800 shrink-0 mx-1" />
                                <button 
                                    onClick={() => setActiveTag("All")}
                                    className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-all border whitespace-nowrap
                                    ${activeTag === "All"
                                        ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none"
                                        : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-emerald-300 dark:hover:border-zinc-700"
                                    }`}
                                >
                                    All
                                </button>
                                {Array.from(availableTags.entries()).map(([tagName, count]) => (
                                    <button 
                                        key={tagName}
                                        onClick={() => setActiveTag(tagName)}
                                        className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-all border whitespace-nowrap flex items-center gap-2
                                        ${activeTag === tagName
                                            ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none"
                                            : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-emerald-300 dark:hover:border-zinc-700"
                                        }`}
                                    >
                                        {tagName}
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTag === tagName ? "bg-white/20 text-white" : "bg-black/10 dark:bg-white/10 text-slate-500"}`}>
                                            {count}
                                        </span>
                                    </button>
                                ))}
                            </>
                        )}
                     </div>
                ) : (
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Offline Archive</h2>
                        <p className="text-slate-500 dark:text-zinc-400">View exported data securely in your browser.</p>
                    </div>
                )}
            </div>

            {/* Right: Action Buttons */}
            <div className="flex gap-3 shrink-0">
                {isLoaded ? (
                    <Button 
                        variant="destructive" 
                        className="rounded-xl shadow-lg shadow-red-100 dark:shadow-none"
                        onClick={handleClear}
                    >
                        <Trash2 size={16} className="mr-2" />
                        Clear Data
                    </Button>
                ) : (
                    <Button 
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 dark:shadow-none"
                        onClick={handleTauriSelect} 
                        disabled={!!loadingText}
                    >
                         {loadingText || <><FolderOpen size={16} className="mr-2" /> Select Folder</>}
                    </Button>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    // @ts-ignore
                    webkitdirectory=""
                    directory=""
                    multiple
                    onChange={() => {}}
                />
            </div>
        </div>

        {/* 3. Content Area */}
        {!isLoaded ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-full max-w-2xl p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                        <FolderSearch className="text-emerald-600 dark:text-emerald-400" size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Folder Selected</h3>
                    <p className="text-slate-500 dark:text-zinc-400 max-w-md mb-8">
                    Select a folder containing your data. We support: <br/>
                    <span className="text-xs font-mono bg-slate-200 dark:bg-zinc-800 px-1 rounded">result.json</span> (Telegram) OR <span className="text-xs font-mono bg-slate-200 dark:bg-zinc-800 px-1 rounded">Post.json + Button.json</span> (DB)
                </p>
                </div>
            </div>
        ) : (
            <>
                {displayPosts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                            {displayPosts.map((post) => {
                                const filename = post.photo ? post.photo.split("/").pop() || post.photo : null;
                                
                                return (
                                    <LocalPostCard 
                                        key={post.id} 
                                        post={post} 
                                        imageFile={null}
                                        imagePath={filename}
                                        loadImage={loadImage}
                                    />
                                );
                            })}
                        </div>
                        <LocalPaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalCount={totalPosts}
                            onPageChange={setCurrentPage}
                        />
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl bg-slate-50/50 dark:bg-zinc-900/50">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                            <SearchX className="text-slate-400" size={32} />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">No matches found</h3>
                        <p className="text-slate-500 dark:text-zinc-400 max-w-sm mt-2">
                             {searchQuery ? `No local post matches "${searchQuery}".` : "Your filter returned no results."}
                        </p>
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
}