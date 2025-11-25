# DEV_ENVIRONMENT.md

此文件为开发环境创建场景提供专门的指导。当用户需要创建开发环境时使用此文档。

## 开发环境场景概述

**适用情况**: 当用户说出以下任何关键词时，必须使用此文档的流程：
- "创建开发环境", "dev environment", "开发环境", "code-server", "IDE环境"

## 强制性规则执行系统

### 强制性操作
- **必须** 立即调用 MCP 工具创建 Kubernetes 资源
- **必须** 在 Kubernetes 集群中创建开发环境
- **必须** 完成完整的工具调用序列
- **必须** 遵循动态资源命名和端口分配规则

## 强制性执行工作流程

对于任何开发环境创建任务，必须遵循以下确切顺序：

### 1. 基础准备（必须）
- 读取 `code-server.yaml` 模板文件
  ```bash
  Read(code-server.yaml)
  ```
- 确定目标 namespace（默认为 'default'）
- 生成当前时间戳

### 2. 动态资源生成（必须）
- 生成唯一的资源名称：`{namespace}-dev-{timestamp}`
- 生成PVC名称：`{namespace}-dev-pvc-{timestamp}`
- 分配可用的 NodePort 端口（不检查端口占用，依次分配）
- 动态修改 YAML 内容中的名称、端口和namespace
- 使用 `mcp__mcp-k8s__apply_yaml` 直接传入修改后的YAML内容

### 3. 状态检查（必须）
```bash
# 检查Pod创建状态
mcp__mcp-k8s__get_pods namespace="default"

# 检查Service创建状态
mcp__mcp-k8s__get_services namespace="default"
```

## 核心配置

### 基础环境
- **基础镜像**: `registry.opsman.top/kmai/ubuntu:22.04-v1`
- **暴露端口**: SSH(22)
- **资源规格**: CPU 1024m, 内存 4Gi
- **存储**: 10Gi 持久化存储 (PVC)

### 动态命名规范

#### 资源名称格式
- **PVC**: `{namespace}-dev-pvc-{timestamp}`
- **Deployment**: `{namespace}-dev-{timestamp}`
- **Service**: `{namespace}-dev-service-{timestamp}`
- **Labels**: `{namespace}-dev-{timestamp}`

#### 端口分配策略
- **SSH NodePort**: 从 30000 开始，依次递增（步长为1）
- **范围**: 30000-32767（Kubernetes NodePort 有效范围）

#### 时间戳格式
使用Unix时间戳确保唯一性，例如：`1763535607`

## YAML 模板动态修改

### 需要动态修改的部分

#### PVC 部分
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: "{namespace}-dev-pvc-{timestamp}"  # 动态修改
  namespace: "{namespace}"                 # 动态修改
spec:
  accessModes: ["ReadWriteOnce"]
  storageClassName: local-retain
  resources:
    requests:
      storage: 10Gi
```

#### Deployment 部分
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: "{namespace}-dev-{timestamp}"      # 动态修改
  namespace: "{namespace}"                 # 动态修改
  labels:
    app: "{namespace}-dev-{timestamp}"     # 动态修改
spec:
  selector:
    matchLabels:
      app: "{namespace}-dev-{timestamp}"   # 动态修改
  template:
    metadata:
      labels:
        app: "{namespace}-dev-{timestamp}" # 动态修改
    spec:
      volumes:
      - name: code-storage
        persistentVolumeClaim:
          claimName: "{namespace}-dev-pvc-{timestamp}"  # 动态修改
```

#### Service 部分
```yaml
apiVersion: v1
kind: Service
metadata:
  name: "{namespace}-dev-service-{timestamp}"  # 动态修改
  namespace: "{namespace}"                     # 动态修改
spec:
  selector:
    app: "{namespace}-dev-{timestamp}"         # 动态修改
  ports:
  - name: ssh
    nodePort: {available_ssh_port}             # 动态分配
```

## 端口分配实现

### 端口分配逻辑（简化版）
```python
# 端口起始值
BASE_SSH_PORT = 30000
PORT_STEP = 1  # SSH端口递增步长

def allocate_ports(timestamp):
    """根据时间戳计算端口分配"""
    # 简单的哈希算法确保端口分散但可预测
    port_offset = timestamp % 1000
    ssh_port = BASE_SSH_PORT + port_offset

    # 确保端口在有效范围内
    if ssh_port > 32767:
        ssh_port = BASE_SSH_PORT + (timestamp % 500)

    return ssh_port
```

### 示例端口分配
- **时间戳**: 1763535607
- **SSH端口**: 30000 + (1763535607 % 1000) = 30607

## 关键配置文件

### `code-server.yaml`
- **PVC模板**: 持久化存储声明定义
- **Deployment模板**: 包含容器定义和资源规格
- **Service模板**: NodePort类型的服务定义
- **注意**: 此文件仅作为模板，实际创建时使用 `mcp__mcp-k8s__apply_yaml` 传入动态修改后的内容

## 使用示例

### 创建开发环境的完整流程

1. **读取模板**
```bash
Read - file_path="code-server.yaml"
```

2. **生成动态参数**
```bash
# 获取当前时间戳
TIMESTAMP=$(date +%s)
NAMESPACE="default"

# 计算端口
SSH_PORT=$((30000 + (TIMESTAMP % 1000)))

# 生成资源名称
PVC_NAME="${NAMESPACE}-dev-pvc-${TIMESTAMP}"
DEPLOYMENT_NAME="${NAMESPACE}-dev-${TIMESTAMP}"
SERVICE_NAME="${NAMESPACE}-dev-service-${TIMESTAMP}"
```

3. **应用动态YAML**
```bash
mcp__mcp-k8s__apply_yaml yaml_content="{动态修改后的YAML内容}"
```

4. **检查创建状态**
```bash
mcp__mcp-k8s__get_pods namespace="${NAMESPACE}"
mcp__mcp-k8s__get_services namespace="${NAMESPACE}"
```

## 访问开发环境

### 连接方式
- **SSH**: `ssh -p {SSH_NODEPORT} {NODE_IP}`

### 获取访问信息
创建完成后，可以通过以下命令获取访问信息：
```bash
# 获取Node IP（通常为主节点IP）
kubectl get nodes -o wide

# 获取Service的NodePort信息
kubectl get service {SERVICE_NAME} -n {NAMESPACE}
```

## 故障排除

### 常见问题
- **Pod启动失败**: 检查镜像拉取权限和资源配额
- **端口冲突**: 端口分配算法已尽量规避，但仍有极小概率冲突
- **网络访问**: 确保防火墙允许NodePort范围内的端口访问

### 调试命令
```bash
# 查看Pod日志
mcp__mcp-k8s__kubectl command="logs deployment/{DEPLOYMENT_NAME} -n {NAMESPACE}"

# 查看Pod详情
mcp__mcp-k8s__kubectl command="describe pod -l app={DEPLOYMENT_NAME} -n {NAMESPACE}"

# 查看Service详情
mcp__mcp-k8s__kubectl command="describe service {SERVICE_NAME} -n {NAMESPACE}"
```

## 重要提醒

- **不检查端口占用**：按照算法依次分配，避免复杂的端口检查逻辑
- **不自动清理**：开发环境持续运行，需要手动清理
- **不修改镜像**：使用预定义的Ubuntu镜像，包含必要开发工具
- **资源固定**：使用预定义的CPU和内存规格，不动态调整