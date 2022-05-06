## 所需配置

下载并安装`Docker For Desktop`。另外，这里默认使用者有访问外网的能力，如果没，需要将 Docker 镜像改为国内源，具体教程请百度自行搜索。

1. 前往该仓库下的`elk`文件夹，添加配置`.env`文件。它能直接用来配置`docker-compose.yml`。以下为基于官方文档改进的配置Demo：
   ```env
   # Password for the 'elastic' user (at least 6 characters)
    ELASTIC_PASSWORD=CHANGEME

    # Password for the 'kibana_system' user (at least 6 characters)
    KIBANA_PASSWORD=CHANGEME

    # Version of Elastic products
    STACK_VERSION=8.2.0

    # Set the cluster name
    CLUSTER_NAME=es

    # Set to 'basic' or 'trial' to automatically start the 30-day trial
    LICENSE=basic
    #LICENSE=trial

    # Port to expose Elasticsearch HTTP API to the host
    ES_PORT=9200
    # ES_PORT=127.0.0.1:9200

    # Port to expose Kibana to the host
    KIBANA_PORT=5601
    #KIBANA_PORT=80

    # Increase or decrease based on the available host memory (in bytes)
    MEM_LIMIT=1073741824

    # Project namespace (defaults to the current folder name if not set)
    COMPOSE_PROJECT_NAME=policy_search_elk

   ```
2. 在该目录中使用`docker-compose up -d`。首次下载时需要下载镜像，可能需要几分钟时间，稍等片刻。

3. 这时你应该可以直接访问 Kibana，链接为： http://localhost:5601 账户名和密码为在`.env`内设置的elastic用户部分。

4. 此时你可以通过 cURL`http://USERNAME:PASSWORD@lcoalhost:9200`（用户名和密码需要修改为实际内容）或去`Kibana` `Dev Tools`用 ES 的`Query DSL`进行查询。详情请参见[官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-filter-context.html)
5. 创建一个新的 index，并进行分词设置。如：
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