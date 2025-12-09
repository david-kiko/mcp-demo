#!/bin/bash

# 设置root密码
echo "root:${ROOT_PASSWORD:-root}" | chpasswd

# 创建 kmcode-cli 配置文件
if [ -n "$KMCODE_CONFIG" ]; then
    mkdir -p ~/.kmcode-cli
    echo "$KMCODE_CONFIG" > ~/.kmcode-cli/config.json
    echo "kmcode-cli config created at ~/.kmcode-cli/config.json"
fi

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