## 搭建思路

### 为什么使用 Docker

1. 我在服务器申请下来前就已在开发机 WSL2 环境中研究 ELK 并进行本地部署，将现有应用迁移到服务器很容易。只需迁移`docker-compose.yml`及其他配置文件即可
2. 避免环境造成的影响，日后系统升级或者升级单个应用不会对其他应用造成影响，方便分析问题。
3. 由于网络问题，进行本地开发，docker-image 直接下载并部署。校服务器网络问题无解。

### 为什么基于 ELK 7.12.0 及以上 版本

现已使用 7.14.0，升级后系统配置会消失(Docker 部署弊端)，谨慎升级

1. Client 端兼容性更强。原使用 6.8.14 版本（6 系最新），但截至 2021-04-13，ELK 6.8.14 只有 Java 客户端进行完全兼容，Node.js 6.8.8 版本可用，Python 端 6.X 系列更是只兼容了 6.8.1，之后就再也没有推进 6.8.X 新版本兼容，专注 7 系列更新。ELK 7.12.0 客户端 Java 和 Node.js 都已兼容，Python 端虽然目前只有 7.11.0，但预计半个月内也能完成兼容。
2. ELK 7.12.0 起支持 ARM 系统，便于日后用苹果 M 系列芯片开发成员开发。

### 为什么目前只使用 ElasticSearch 单节点模式

ES 多节点本身是为了整合多服务器设置的，其中分页备份主要是为了避免服务器集群因单节点`物理受损`导致大部分内容损失。所以即使本服务器性能足够，且 Docker 可以较轻松进行环境分离和多节点模拟，多节点模式并没有什么用。

### 其他仓库运行本仓库所需设置

这里默认使用者有访问外网的能力，如果没，需要将 Docker 镜像改为国内源，具体教程可 Google 自行搜索。

1. cd 到`elk`文件夹中使用`docker-compose up -d`。首次下载时需要下载镜像，可能需要几分钟时间，稍等片刻。

2. `docker exec -it elasticsearch bash` 进入容器环境中，然后`bin/elasticsearch-setup-passwords auto`，遇到提示按 enter 就行。这样就能得到一个像下文一样的默认密码。

   ```txt
   Changed password for user apm_system
   PASSWORD apm_system = CHANGEME

   Changed password for user kibana_system
   PASSWORD kibana_system = CHANGEME

   Changed password for user kibana
   PASSWORD kibana = CHANGEME

   Changed password for user logstash_system
   PASSWORD logstash_system = CHANGEME

   Changed password for user beats_system
   PASSWORD beats_system = CHANGEME

   Changed password for user remote_monitoring_user
   PASSWORD remote_monitoring_user = CHANGEME

   Changed password for user elastic
   PASSWORD elastic = CHANGEME
   ```

   建议将密码保存在本地或如`bitwarden`之类的密码管理器中以免日后遗忘。

3. 在`elk`文件夹下创建一个`secret_data`文件夹，并在`secret_data`文件夹中创建`KIBANA_SYSTEM_PASSWORD.env`文件，放置如下内容：

   ```env
   ELASTICSEARCH_PASSWORD=CHANGEME
   ```

   注意，此处要把密码改为上文的`kibana_system`密码。

4. cd 到`elk`文件夹，`docker-compose down`后再`docker-compose up -d`。此时在`localhost:9200`和`localhost:5601`输入上文获取的`elastic`对应用户名和密码，就能直接获取数据或者进入后台管理中心了。
5. 此时你可以通过 cURL`http://USERNAME:PASSWORD@lcoalhost:9200`或去`Kibana` `Dev Tools`用 ES 的`Query DSL`进行查询。详情请参见[文档](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-filter-context.html)
6. 创建一个新的 index，并进行分词设置。如：
   ```
   PUT policy
   {
     "settings": {
       "analysis":{
         "analyzer": {
           "default":{
           "type": "ik_max_word"
           },
           "default_search":{
             "type":"ik_smart"
           }
         }
       }
     }
   }
   ```
   这样在放入新数据时它会自动使用分词器进行分词。需注意的是，`Elasticsearch`会对输入的内容默认采用分词策略，而系统默认的`Standard`对中文分词默认使用单字分割，如`北京`分词后变成`北`、`京`。若未进行如上面的设置，搜索`北京`既能得到`北京`，又能得到`北`、`京`（如【京】 xxxx 号文件）因为搜索时也会把搜素内容分为`北`和`京`两个字，从而导致搜索的不准确。

## Q&A

1.  initial heap size [536870912] not equal to maximum heap size [1073741824]; this can cause resize pauses and prevents mlockall from locking the entire heap

"ES_JAVA_OPTS=-Xms2g -Xmx2g" ：让 Xms 和 Xmx 两值相等。

2. 其他可参考：[WSL#4232](https://github.com/microsoft/WSL/issues/4232), [docker/for-win#5202](https://github.com/docker/for-win/issues/5202) 和 [踩坑日志](https://gricn.github.io/%E6%8A%80%E6%9C%AF%E5%88%86%E4%BA%AB/ELK_build/)

3. Git 加速： 如何加速 GitHub 下载。尝试使用[这篇博文](https://blog.frytea.com/archives/504/)提及的方法进行 git 下载加速。
