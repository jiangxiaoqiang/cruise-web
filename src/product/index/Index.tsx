import React, { useState } from 'react'
import { Col, Divider, Row, Spin, Tabs } from 'antd';
import 'antd/dist/antd.css';
import './Index.css';
import { connect, RootStateOrAny } from 'react-redux';
import * as articleService  from '../../service/ArticleService';
import InfiniteScroll from 'react-infinite-scroll-component';
import About from '../about/About';
import { useSelector } from 'react-redux'
import { clearArticles, getArticle, getOfficialArticles, getRecommandArticles } from '../../action/ArticleAction';
import store from "../../store";
import TimeUtils from "js-wheel/dist/src/utils/time/time";

const { TabPane } = Tabs;

const Index: React.FC = (props) => {

  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [offset, setOffset] = useState();
  const [tabKey, setTabKey] = useState("-1");

  const [localArticle, setLocalArticle] = useState(new Map<number, any>());
  let articles = useSelector((state: RootStateOrAny) => state.article);

  React.useEffect(() => {
    let params = {
      pageSize : pageSize,
      pageNum: 1
    };
    articleService.getRecommandArticlesImpl(params);
  }, []);

  const onChange = (key: string) => {
    store.dispatch(clearArticles());
    fetchNewestArticles(key);
  };

  const fetchNewestArticles = (key: string) => {
    let offset: number[] = Array.from(localArticle.keys());
    let params = {
      pageSize : 20,
      pageNum: 1,
      offset: Math.max(...offset)
    };
    if(key === '1'){
      articleService.getRecommandArticlesImpl(params).then((result) => {
        setTabKey("1");
      });
    }
    if(key === '2'){
      articleService.getOfficialArticlesImpl(params).then((result) => {
        setTabKey("2");
      });
    }
  }

  const renderArticles = (articleArray: API.ArticleListItem[]) => {
    var elements = new Map();
    if(articleArray && articleArray.length > 0) {
      articleArray.forEach(article => {
      if(!localArticle.has(article.id)) {
        var articleDom: JSX.Element = (<div key={article.id}>
          <Row>
            <Col>
              <div style={{fontSize:15,fontWeight: 'bold'}}>
                <a href={article.link} target="_blank">{article.title}</a>
              </div>
            </Col>
            <Col>
              <div style={{verticalAlign: 'middle',color:'#789',marginLeft:16,fontSize:13,fontWeight: '500'}}>{TimeUtils.getPrevFormattedTime(parseInt(article.createdTime))}</div>
            </Col>
          </Row>
          <Divider></Divider>
          </div>);
          elements.set(article.id, articleDom);
        }
      });
    }
    if(elements && elements.size > 0){
      setLocalArticle(new Map([...localArticle].concat([...elements])));
    }
  }

  var arrayArticles: API.ArticleListItem[] = articles&&articles.article?articles.article.list:[];
  if(arrayArticles){
    renderArticles(arrayArticles);
  }else{
    if(localArticle.size> 0){
      setLocalArticle(new Map<number, any>());
    }
  }
  
  const fetchMoreData = () => {
    let newPageNum = pageNum + 1;
    let offset: number[] = Array.from(localArticle.keys());
    let params = {
      pageNum: newPageNum,
      pageSize: pageSize,
      offset: Math.max(...offset)
    };
    if(tabKey === "1"){
      articleService.getRecommandArticlesImpl(params).then(()=>{
        setPageNum(newPageNum);
      });
    }
    if(tabKey === "2"){
      articleService.getOfficialArticlesImpl(params).then(()=>{
        setPageNum(newPageNum);
      });
    }
  }

  const refreshArticles = () => {
    fetchNewestArticles(tabKey);
  }

  let items: JSX.Element[] = Array.from(localArticle.values());

  const renderList = (items: JSX.Element[]) => {
    if(items.length == 0){
      return (<div><Spin /></div>);
    }
    return (<InfiniteScroll
      dataLength={localArticle.size} 
      next={fetchMoreData}
      hasMore={true}
      loader={<h4><Spin /></h4>}
      endMessage={
        <p style={{textAlign: 'center'}}>
          <b>Yay! You have seen it all</b>
        </p>
      }
      // below props only if you need pull down functionality
      refreshFunction={refreshArticles}
      pullDownToRefresh
      pullDownToRefreshContent={
        <h3 style={{textAlign: 'center'}}>↓ Pull down to refresh</h3>
      }
      releaseToRefreshContent={
        <h3 style={{textAlign: 'center'}}>↑ Release to refresh</h3>
      }>
      {items}
    </InfiniteScroll>);
  }
  
  return (
    <div>
      <Row justify="center">
        <Col span={10}>
          <Tabs defaultActiveKey="1" onChange={onChange} size="large" style={{ marginTop: 10 }}>
            <TabPane tab={<span style={{fontSize:18, fontWeight: 'bold'}}>编辑推荐</span>} key="1">
              {renderList(items)}
            </TabPane>
            <TabPane tab={<span style={{fontSize:18, fontWeight: 'bold'}}>权威资讯</span>} key="2">
              {renderList(items)}
            </TabPane>
            <TabPane tab={<span style={{fontSize:18, fontWeight: 'bold'}}>关于Cruise</span>} key="3">
              <div>
                <About></About>
              </div>
            </TabPane>
          </Tabs>
        </Col>
      </Row>
      
    </div>
  );
}

const mapStateToProps = state => ({
  article: state.article
});

const mapDispatchToProps = (dispatch) => {
  return {
    getArticle: (article) => {
      dispatch(getArticle(article))
    },
    getRecommandArticles: (article) => {
      dispatch(getRecommandArticles(article))
    },
    getOfficialArticles: (article) => {
      dispatch(getOfficialArticles(article))
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);