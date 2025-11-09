#!/bin/bash

# LG TV Proxy Script
# Bu script bilgisayarınızı proxy olarak kullanır

echo "🔧 LG TV Proxy Başlatılıyor..."
echo ""

# Varsayılan TV IP
DEFAULT_TV_IP="192.168.50.225"

echo "⚠️  Not: TV IP adresi (varsayılan: $DEFAULT_TV_IP)"
read -p "LG TV IP Adresi [$DEFAULT_TV_IP]: " TV_IP
TV_IP=${TV_IP:-$DEFAULT_TV_IP}

echo ""
echo "📡 Proxy başlatılıyor..."
echo "   Host IP: 192.168.50.174"
echo "   TV IP: $TV_IP"
echo "   Port: 3000 (WebSocket)"
echo ""
echo "💡 Uygulamada IP olarak şunu girin: 10.0.2.2"
echo "   Veya: 192.168.50.174 (host bilgisayar)"
echo ""
echo "🔴 Durdurmak için Ctrl+C basın"
echo ""
echo "📝 Test: Tarayıcıda http://localhost:3000 açın"
echo ""

# socat kontrolü
if ! command -v socat &> /dev/null; then
    echo "❌ socat bulunamadı. Yükleniyor..."
    brew install socat
fi

# LG TV için WebSocket proxy (port 3000)
# TCP seviyesinde proxy - WebSocket dahil tüm trafiği yönlendirir
echo "✅ Proxy çalışıyor..."
socat -d -d TCP-LISTEN:3000,fork,reuseaddr TCP:$TV_IP:3000
