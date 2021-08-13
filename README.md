## 搭建思路

### 为什么使用 Docker

1. 我在服务器申请下来前就已在开发机 WSL2 环境中研究 ELK 并进行本地部署，将现有应用迁移到服务器很容易。只需迁移`docker-compose.yml`及其他配置文件即可
2. 避免环境造成的影响，日后系统升级或者升级单个应用不会对其他应用造成影响，方便分析问题。
3. 由于网络问题，进行本地开发，docker-image 直接下载并部署。校服务器网络问题无解。

### 为什么基于 ELK 7.12.0 及以上 版本

现已使用 7.14.0，升级后系统配置会消失(Docker 部署弊端)，谨慎升级

1. Client 端兼容性更强。原使用 6.8.14 版本（6 系最新），但截至 2021-04-13，ELK 6.8.14 只有 Java 客户端进行完全兼容，Node.js 6.8.8 版本可用，Python 端 6.X 系列更是只兼容了 6.8.1，之后就再也没有推进 6.8.X 新版本兼容，专注 7 系列更新。ELK 7.12.0 客户端 Java 和 Node.js 都已兼容，Python 端虽然目前只有 7.11.0，但预计半个月内也能完成兼容。
2. 取消 mapping type，和 6 相比，7 可以省略 mapping type（如`_doc`类）。此外，7 也可以保留 mapping type，不像 8 版本将完全取消 mapping type 那般激进。因此，7 是一个很好的过渡。
3. ELK 7.12.0 起支持 ARM 系统，便于日后用苹果 M 系列芯片开发成员开发。

### 为什么目前只使用 ElasticSearch 单节点模式

ES 多节点本身是为了整合多服务器设置的，其中分页备份主要是为了避免服务器集群因单节点`物理受损`导致大部分内容损失。所以即使本服务器性能足够，且 Docker 可以较轻松进行环境分离和多节点模拟，多节点模式并没有什么用。

## 问题及解决方法

1.  initial heap size [536870912] not equal to maximum heap size [1073741824]; this can cause resize pauses and prevents mlockall from locking the entire heap

"ES_JAVA_OPTS=-Xms2g -Xmx2g" ：Xms 和 Xmx 两值必须相等。

2. 其他可参考：[WSL#4232](https://github.com/microsoft/WSL/issues/4232), [docker/for-win#5202](https://github.com/docker/for-win/issues/5202) 和 [踩坑日志](https://gricn.github.io/%E6%8A%80%E6%9C%AF%E5%88%86%E4%BA%AB/ELK_build/)

3. Git 加速： 如何加速 GitHub 下载。尝试使用[这篇博文](https://blog.frytea.com/archives/504/)提及的方法进行 git 下载加速。
