FROM python:3.12-alpine

# 安装系统依赖（编译工具和库）
RUN apk add --no-cache \
    gcc \
    musl-dev \
    libffi-dev \
    openssl-dev \
    cargo \
    rust \
    curl \
    && rm -rf /var/cache/apk/*

# 安装uv（使用pip安装，更可靠）
RUN pip install --no-cache-dir uv

# 验证uv安装
RUN uv --version

# 设置工作目录
WORKDIR /app

# 复制requirements文件
COPY requirements.txt /app/requirements.txt

# 使用uv安装Python包（--system表示安装到系统Python，--no-cache减少镜像大小）
RUN uv pip install --system --no-cache -r requirements.txt \
    && rm -rf /root/.cache

# 验证安装
RUN python -c "import boto3; import pandas; import numpy; print('✓ 所有包安装成功')" \
    && python -c "import boto3; print(f'✓ boto3版本: {boto3.__version__}')" \
    && python -c "import pandas; print(f'✓ pandas版本: {pandas.__version__}')" \
    && python -c "import numpy; print(f'✓ numpy版本: {numpy.__version__}')"

# 清理编译工具（可选，减小镜像大小）
RUN apk del gcc musl-dev libffi-dev openssl-dev cargo rust curl || true

# 设置环境变量
ENV PYTHONUNBUFFERED=1

# 默认命令
CMD ["python"]

