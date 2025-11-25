#!/bin/bash

# 更新系统并安装SSH服务
apt-get update && apt-get install -y openssh-server sudo curl wget vim git

# 启动SSH服务
service ssh start

# 创建开发用户
useradd -m -s /bin/bash 'devuser'
echo 'devuser:XKLWHliy' | chpasswd
echo 'devuser ALL=(ALL:ALL) NOPASSWD:ALL' >> /etc/sudoers

# 为用户创建SSH目录
mkdir -p /home/devuser/.ssh
chmod 700 /home/devuser/.ssh
chown -R devuser:devuser /home/devuser/.ssh

# 配置SSH允许密码登录
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# 重启SSH服务使配置生效
service ssh restart

# 创建VS Code Server目录结构
mkdir -p /root/.vscode-server/bin
mkdir -p /root/.vscode-server/data
mkdir -p /root/.vscode-server/extensions

# 安装最新版code-server作为备选方案
mkdir -p /root/.vscode
curl -fsSL https://code-server.dev/install.sh | sh -s -- --method=standalone --prefix=/root/.vscode

echo '✅ VS Code环境配置完成'
echo '✅ SSH用户: devuser / XKLWHliy'
echo '✅ code-server备选方案已安装'