#!/bin/bash
# Msgify Lite Auto-Installer (Linux/Mac)

set -e
REPO="miangee21/Msgify-Lite"
VERSION="0.1.1"

echo "🚀 Installing Msgify Lite v${VERSION}..."

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if [ -f /etc/debian_version ]; then
        echo "📦 Debian/Ubuntu detected"
        wget "https://github.com/${REPO}/releases/download/v${VERSION}/Msgify_${VERSION}_amd64.deb"
        sudo dpkg -i "Msgify_${VERSION}_amd64.deb"
        rm "Msgify_${VERSION}_amd64.deb"
    elif [ -f /etc/redhat-release ]; then
        echo "📦 Fedora/RHEL detected"
        wget "https://github.com/${REPO}/releases/download/v${VERSION}/Msgify-${VERSION}-1.x86_64.rpm"
        sudo rpm -i "Msgify-${VERSION}-1.x86_64.rpm"
        rm "Msgify-${VERSION}-1.x86_64.rpm"
    else
        echo "📦 AppImage (Universal)"
        wget "https://github.com/${REPO}/releases/download/v${VERSION}/Msgify_${VERSION}_amd64.AppImage"
        chmod +x "Msgify_${VERSION}_amd64.AppImage"
        sudo mv "Msgify_${VERSION}_amd64.AppImage" /usr/local/bin/msgify
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "❌ macOS builds not available yet"
    exit 1
else
    echo "❌ Use install.ps1 for Windows"
    exit 1
fi

echo "✅ Msgify Lite installed successfully!"
echo "Run: msgify"