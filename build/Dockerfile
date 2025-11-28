FROM ubuntu:22.04

# 设置默认密码（可通过环境变量覆盖）
ENV ROOT_PASSWORD=root
ENV ACCESS_PASSWORD=admin123
ENV TTYD_PASSWORD=

# 更新包管理器并安装必要的软件
RUN apt-get update && apt-get install -y \
    openssh-server \
    curl \
    wget \
    gnupg \
    ca-certificates \
    lsb-release \
    jq \
    vim \
    coreutils \
    iputils-ping \
    telnet \
    net-tools \
    dnsutils \
    traceroute \
    nmap \
    unzip \
    zip \
    htop \
    git \
    gdebi \
    && rm -rf /var/lib/apt/lists/*

# 配置SSH服务
RUN mkdir /var/run/sshd
RUN echo 'PermitRootLogin yes' >> /etc/ssh/sshd_config
RUN echo 'PasswordAuthentication yes' >> /etc/ssh/sshd_config


# 安装 Node.js (Claude Code CLI 和 code-server 需要 Node.js 18+)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs

# 复制并安装 code-server (使用本地 deb 包)
COPY code-server_4.105.1_amd64.deb /tmp/code-server.deb
RUN gdebi -n /tmp/code-server.deb && \
    rm /tmp/code-server.deb

# 复制并安装 ttyd (web终端)
COPY ttyd.x86_64 /usr/local/bin/ttyd
RUN chmod +x /usr/local/bin/ttyd

# 安装 kmcode-cli
# RUN npm install -g @kmsoft-ai/kmcode-cli --registry http://192.168.31.100:4873/ --force

# 安装 Claude Code CLI
RUN npm install -g @anthropic-ai/claude-code

# 设置工作目录
WORKDIR /workspace

# 创建 code-server 配置目录和配置文件
RUN mkdir -p /root/.config/code-server && \
    echo 'bind-addr: 0.0.0.0:8080' > /root/.config/code-server/config.yaml && \
    echo 'auth: password' >> /root/.config/code-server/config.yaml && \
    echo 'cert: false' >> /root/.config/code-server/config.yaml

# 暴露端口
EXPOSE 22 8080 7681

# 创建启动脚本
COPY start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

# 设置启动命令
CMD ["/usr/local/bin/start.sh"]