import React, { useState } from 'react'
import styles from './Index.module.css';
import { RootStateOrAny } from 'react-redux';
import * as articleService from '../../../service/ArticleService';
import InfiniteScroll from 'react-infinite-scroll-component';
import About from '../about/About';
import { useSelector } from 'react-redux'
import { clearArticles } from '@/action/ArticleAction';
import store from "../../../store";
import { AuthHandler, TimeUtils } from "rdjs-wheel";
import Panel from '../menu/panel/Panel';
import { doLoginOut, getCurrentUser } from '@/service/user/UserService';
import { PayCircleOutlined, ToolOutlined, LogoutOutlined, ControlOutlined } from '@ant-design/icons';
import { IUserModel } from '@/models/user/UserModel';
import { Footer, Goods, UserService, withConnect } from "rd-component";
import { readConfig } from '@/config/app/config-reader';
import "@/scss/style.scss";
import avatarImg from "@/asset/icon/avatar.png";

const Index: React.FC = () => {

  const [pageNum, setPageNum] = useState(1);
  const [isGetUserLoading, setIsGetUserLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<IUserModel>();
  const [pageSize] = useState(20);
  const [offset, setOffset] = useState(new Map<string, number>());
  const [tabKey, setTabKey] = useState<number>(0);
  const [localArticle, setLocalArticle] = useState(new Map<string, any>());
  let articles = useSelector((state: RootStateOrAny) => state.article);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') || false);

  React.useEffect(() => {
    tabsTrigger();
    document.addEventListener("click", handleMenuClose);
    return () => {
      document.removeEventListener("click", handleMenuClose);
    };
  }, []);

  React.useEffect(() => {
    showTabImpl();
    if (tabKey === 5 && isLoggedIn) {
      if (!userInfo) {
        const storeUser = localStorage.getItem("userInfo");
        if (storeUser) {
          setUserInfo(JSON.parse(storeUser));
        }
      }
    }
  }, [tabKey]);

  const handleMenuClose = (event: any) => {
    const menu = document.getElementById('user-menu');
    const dropdown = document.getElementById('dropdown');
    if (menu && dropdown) {
      const target = event.target;
      if (!menu.contains(target)) {
        dropdown.style.display = 'none';
      }
    }
  }

  const loadCurrentUser = () => {
    if (!localStorage.getItem("userInfo") && isGetUserLoading === false) {
      setIsGetUserLoading(true);
      getCurrentUser().then((data) => {
        setUserInfo(data.result);
        localStorage.setItem("userInfo", JSON.stringify(data.result));
        setIsGetUserLoading(false);
      });
    }
  }

  const tabsTrigger = () => {
    var tabs = document.getElementsByClassName(`${styles.tab}`);
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener("click", function (this: any) {
        setTabKey(this.getAttribute("data-tab-index"));
      });
    }
  }

  const showTabImpl = () => {
    var tabContainers = document.getElementsByClassName(`${styles.tabContent}`);
    for (var i = 0; i < tabContainers.length; i++) {
      tabContainers[i].classList.remove(`${styles.active}`);
    }
    tabContainers[tabKey].classList.add(`${styles.active}`);
    var tabs = document.getElementsByClassName(`${styles.tab}`);
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.remove(`${styles.active}`);
    }
    tabs[tabKey].classList.add(`${styles.active}`);
    store.dispatch(clearArticles());
    fetchNewestArticles(Number(tabKey));
  }

  const userLogin = () => {
    let params = {
      appId: "oloLNAXvJu"
    }
    articleService.userLoginAlipayImpl(params).then(data => {
      window.location.href = data.result;
    });
  }

  const fetchNewestArticles = (key: number) => {
    setPageNum(1);
    if (key === 0) {
      let params = {
        pageSize: 20,
        pageNum: 1,
        offset: Number(offset.get('recommand')) > 0 ? offset.get('recommand') : null
      };
      articleService.getRecommandArticlesImpl(params).then((data) => {
        if (offset.get('recommand')) {
          return;
        }
        if (data && data.result) {
          var ids = data.result.list.map((item: { id: number; }) => item.id);
          var newOffset = new Map();
          var maxId = Math.max(...ids);
          newOffset.set('recommand', maxId);
          setOffset(new Map([...offset].concat([...newOffset])))
        }
      });
    }
    if (key === 1) {
      let params = {
        pageSize: 20,
        pageNum: 1,
        offset: offset.get('official')
      };
      articleService.getOfficialArticlesImpl(params).then((data) => {
        if (offset.get('official')) {
          return;
        }
        if (data && data.result) {
          var ids = data.result.list.map((item: { id: number; }) => item.id);
          var newOffset = new Map();
          var maxId = Math.max(...ids);
          newOffset.set('official', maxId);
          setOffset(new Map([...offset].concat([...newOffset])))
        }
      });
    }
    if (key === 2) {
      let params = {
        pageSize: 20,
        pageNum: 1,
        offset: offset.get('original')
      };
      articleService.getOriginalArticlesImpl(params).then((data) => {
        if (offset.get('original')) {
          return;
        }
        if (data && data.result) {
          var ids = data.result.list.map((item: { id: number; }) => item.id);
          var newOffset = new Map();
          var maxId = Math.max(...ids);
          newOffset.set('original', maxId);
          setOffset(new Map([...offset].concat([...newOffset])))
        }
      });
    }
  }

  const handleLogout = () => {
    doLoginOut();
  }

  const handleControlPanel = () => {
    setTabKey(5);
  }

  const handleCruisePro = () => {
    setTabKey(4);
  }

  const avatarClick = () => {
    const dropdown = document.getElementById("dropdown");
    if (dropdown) {
      if (dropdown.style.display == "none" || dropdown.style.display == "") {
        dropdown.style.display = "block";
      } else {
        dropdown.style.display = "none";
      }
    }
  }

  const renderLogin = () => {
    if (UserService.isLoggedIn()) {
      var avatarUrl = localStorage.getItem('avatarUrl');
      return (
        <a id="user-menu">
          {avatarUrl ? <img className={styles.avatarImg} src={avatarUrl} onClick={avatarClick} /> : <img className={styles.avatarImg} src={avatarImg} onClick={avatarClick} ></img>}
          <div id="dropdown" className={styles.dropdownContent}>
            <div onClick={() => handleCruisePro()}><PayCircleOutlined /><span>订阅</span></div>
            <div onClick={() => handleControlPanel()}><ControlOutlined /><span>控制台</span></div>
            <div onClick={() => UserService.doLoginOut(readConfig("logoutUrl"))}><LogoutOutlined /><span>登出</span></div>
          </div>
        </a>
      );
    }

    const accessTokenOrigin = document.cookie.split('; ').find(row => row.startsWith('accessToken='));
    if (accessTokenOrigin) {
      AuthHandler.storeCookieAuthInfo(accessTokenOrigin, readConfig("baseAuthUrl"), readConfig("accessTokenUrlPath"));
      loadCurrentUser();
      setIsLoggedIn(true);
    }
    return (
      <div className={styles.login}>
        <button className={`btn-primary ${styles.loginBtn} `} onClick={userLogin}>登录</button>
      </div>
    );
  }

  const renderArticles = (articleArray: API.ArticleListItem[]) => {
    var elements = new Map();
    if (articleArray && articleArray.length > 0) {
      articleArray.forEach(article => {
        if (!localArticle.has(article.title)) {
          var articleDom: JSX.Element = (
            <div key={article.id}>
              <div className={`${styles.articleItem} 'list-group-item d-flex justify-content-between align-items-start'`}>
                <div>
                  <div>
                    <a href={article.link} className={styles.articleTitle} target="_blank" rel="noreferrer">{article.title}</a>
                  </div>
                </div>
                <div>
                  <div style={{ verticalAlign: 'middle', color: '#789', marginLeft: 16, fontSize: 13, fontWeight: '500' }}>{TimeUtils.getPrevFormattedTime(parseInt(article.createdTime))}</div>
                </div>
              </div>
              <div></div>
            </div>);
          elements.set(article.title, articleDom);
        }
      });
    }
    if (elements && elements.size > 0) {
      setLocalArticle(new Map([...localArticle].concat([...elements])));
    }
  }

  var arrayArticles: API.ArticleListItem[] = articles && articles.article ? articles.article.list : [];
  if (arrayArticles) {
    renderArticles(arrayArticles);
  } else {
    if (localArticle.size > 0) {
      setLocalArticle(new Map<string, any>());
    }
  }

  const getArtcleKeys = (articles: any[]) => {
    let keys: number[] = [];
    articles.forEach(article => {
      let key = article.key;
      keys.push(parseInt(key));
    });
    return keys;
  }

  const fetchMoreData = (currentTabKey: number) => {
    const curTab = (currentTabKey !== Number(tabKey));
    if (curTab) {
      // prevent trigger the fetch more with the unactive infinite scroll
      // https://stackoverflow.com/questions/54711042/how-to-prevent-infinite-scroll-from-loading-pages-when-the-tab-is-not-active
      return;
    }
    let newPageNum = pageNum + 1;
    let articles = Array.from(localArticle.values());
    let offset: number[] = getArtcleKeys(articles);
    let params = {
      pageNum: newPageNum,
      pageSize: pageSize,
      offset: Math.max(...offset)
    };
    if (currentTabKey === 0) {
      articleService.getRecommandArticlesImpl(params).then(() => {
        setPageNum(newPageNum);
      });
    }
    if (currentTabKey === 1) {
      articleService.getOfficialArticlesImpl(params).then(() => {
        setPageNum(newPageNum);
      });
    }
    if (currentTabKey === 2) {
      articleService.getOriginalArticlesImpl(params).then(() => {
        setPageNum(newPageNum);
      });
    }
  }

  const refreshArticles = () => {
    store.dispatch(clearArticles());
    fetchNewestArticles(tabKey);
  }

  let items: JSX.Element[] = Array.from(localArticle.values());

  const renderList = (items: JSX.Element[], currentTabKey: number) => {
    if (items.length === 0) {
      return (<div></div>);
    }
    return (
      <InfiniteScroll
        dataLength={localArticle.size}
        next={fetchMoreData.bind(this, Number(currentTabKey))}
        hasMore={true}
        loader={<h4></h4>}
        endMessage={
          <p style={{ textAlign: 'center' }}>
            <b>没有更多</b>
          </p>
        }
        refreshFunction={refreshArticles}
        pullDownToRefresh={true}
        pullDownToRefreshContent={
          <div style={{ textAlign: 'center' }}>↓下拉刷新</div>
        }
        releaseToRefreshContent={
          <div style={{ textAlign: 'center' }}>↑松开刷新</div>
        }>
        {items}
      </InfiniteScroll>);
  }

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.left}>
        </div>
        <div className={styles.center}>
          <div className={styles.tabContainer}>
            <div className={`${styles.tab} ${styles.active}`} data-tab-index="0">编辑推荐</div>
            <div className={styles.tab} data-tab-index="1">权威资讯</div>
            <div className={styles.tab} data-tab-index="2">原始资讯</div>
            <div className={styles.tab} data-tab-index="3">关于Cruise</div>
            <div className={styles.tab} data-tab-index="4"></div>
            <div className={styles.tab} data-tab-index="5"></div>
            <div className={styles.userLogin} data-tab-index="">
              {renderLogin()}
            </div>
          </div>

          <div className={styles.tabContentContainer}>
            <div className={styles.tabContent} data-tab-index="0">
              {renderList(items, 0)}
            </div>
            <div className={styles.tabContent} data-tab-index="1">
              {renderList(items, 1)}
            </div>
            <div className={styles.tabContent} data-tab-index="2">
              {renderList(items, 2)}
            </div>
            <div className={styles.tabContent} data-tab-index="3">
              <About></About>
            </div>
            <div className={styles.tabContent} data-tab-index="4">
              <Goods refreshUrl={readConfig("refreshUserUrl")} appId={readConfig("appId")} store={store}></Goods>
            </div>
            <div className={styles.tabContent} data-tab-index="5">
              <Panel panelUserInfo={userInfo}></Panel>
            </div>
          </div>
        </div>
        <div className={styles.right}>
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
}

export default withConnect(Index);