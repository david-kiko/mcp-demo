#!/bin/bash

# 设置root密码
echo "root:${ROOT_PASSWORD:-root}" | chpasswd

# 启动SSH服务
service ssh start

# 启动ttyd (Web终端)
if [ -n "$TTYD_PASSWORD" ]; then
    /usr/local/bin/ttyd -p 7681 -i 0.0.0.0 -c root:$TTYD_PASSWORD -W /bin/bash &
else
    /usr/local/bin/ttyd -p 7681 -i 0.0.0.0 -W /bin/bash &
fi

# 启动code-server (VS Code Web)
PASSWORD="${ACCESS_PASSWORD:-admin123}" code-server