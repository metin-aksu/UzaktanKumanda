#!/bin/bash

# Philips TV Proxy Script
# Bu script bilgisayarınızı proxy olarak kullanır

echo "🔧 Philips TV Proxy Başlatılıyor..."
echo ""
echo "⚠️  Not: TV IP adresinizi girin (örnek: 192.168.1.100)"
read -p "Philips TV IP Adresi: " TV_IP

echo ""
echo "📡 Proxy başlatılıyor..."
echo "   Host IP: 192.168.50.174"
echo "   TV IP: $TV_IP"
echo ""
echo "💡 Uygulamada IP olarak şunu girin: 10.0.2.2"
echo ""
echo "🔴 Durdurmak için Ctrl+C basın"
echo ""

# socat kontrolü
if ! command -v socat &> /dev/null; then
    echo "❌ socat bulunamadı. Yükleniyor..."
    brew install socat
fi

# Philips TV için HTTP proxy (port 1925)
socat TCP-LISTEN:1925,fork,reuseaddr TCP:$TV_IP:1925
