#!/bin/bash

# LG TV Bağlantı Test Script
# Bu script LG TV'ye bağlantıyı test eder

echo "🧪 LG TV Bağlantı Testi"
echo ""

# Varsayılan TV IP
DEFAULT_TV_IP="192.168.50.225"

read -p "LG TV IP Adresi [$DEFAULT_TV_IP]: " TV_IP
TV_IP=${TV_IP:-$DEFAULT_TV_IP}

echo ""
echo "🔍 Test ediliyor: $TV_IP"
echo ""

# Test 1: Ping
echo "1️⃣ Ping testi..."
if ping -c 3 $TV_IP > /dev/null 2>&1; then
    echo "   ✅ TV'ye erişilebilir"
else
    echo "   ❌ TV'ye erişilemiyor"
    echo "   💡 TV ve bilgisayar aynı ağda mı?"
    exit 1
fi

# Test 2: Port 3000 kontrolü
echo ""
echo "2️⃣ Port 3000 kontrolü..."
if nc -z -w 5 $TV_IP 3000 2>/dev/null; then
    echo "   ✅ Port 3000 açık"
else
    echo "   ❌ Port 3000 kapalı veya erişilemiyor"
    echo "   💡 TV açık mı? WebOS aktif mi?"
    exit 1
fi

# Test 3: HTTP testi
echo ""
echo "3️⃣ HTTP yanıt testi..."
HTTP_RESPONSE=$(curl -s -m 5 http://$TV_IP:3000 2>&1)
if [ $? -eq 0 ]; then
    echo "   ✅ HTTP yanıt alındı"
    echo "   📝 Yanıt: ${HTTP_RESPONSE:0:50}..."
else
    echo "   ⚠️  HTTP yanıt alınamadı (normal - WebSocket bekliyor)"
fi

# Test 4: WebSocket testi (basit)
echo ""
echo "4️⃣ WebSocket handshake testi..."
WS_TEST=$(echo -e "GET / HTTP/1.1\r\nHost: $TV_IP:3000\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n\r\n" | nc -w 5 $TV_IP 3000 2>&1)
if echo "$WS_TEST" | grep -q "101\|Upgrade"; then
    echo "   ✅ WebSocket sunucusu yanıt veriyor"
else
    echo "   ⚠️  WebSocket handshake belirsiz"
    echo "   📝 Yanıt: ${WS_TEST:0:100}"
fi

# Test 5: Bilgisayar ağ bilgileri
echo ""
echo "5️⃣ Ağ bilgileri..."
MY_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
echo "   📍 Bilgisayar IP: $MY_IP"
echo "   📍 TV IP: $TV_IP"
echo "   🌐 Alt ağ: $(echo $MY_IP | cut -d. -f1-3).x"

if [[ $(echo $MY_IP | cut -d. -f1-3) == $(echo $TV_IP | cut -d. -f1-3) ]]; then
    echo "   ✅ Aynı alt ağdasınız"
else
    echo "   ⚠️  Farklı alt ağlarda olabilirsiniz"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Özeti"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "iOS Simulator için:"
echo "  IP Adresi: $TV_IP"
echo ""
echo "Android Emülatör için:"
echo "  1. Proxy başlat: ./start-lg-proxy.sh"
echo "  2. IP Adresi: 10.0.2.2"
echo "     veya: $MY_IP"
echo ""
echo "Fiziksel cihaz için:"
echo "  IP Adresi: $TV_IP"
echo ""
