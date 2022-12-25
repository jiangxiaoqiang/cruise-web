import './Footer.css';
import React from "react";
import { Col, Divider, Row } from 'antd';

const Footer: React.FC = (props) => {
  return (
    <div className="App-footer-float">
      <div id="footer" className="App-footer">
        <Divider></Divider>
        <div>
          <Row justify="center" align="middle">
            <Col>
              <div>© 2022 RedDwarf 重庆红矮星科技有限公司 <a href="http://beian.miit.gov.cn/">渝ICP备2021003460号-1</a> <a href="mailto:jiangxiaoqiang@zqhaxkjyxgs.wecom.work">联系我们</a></div>
            </Col>
          </Row>
          <Row justify="center" align="middle">
            <Col>
              <div><img src="./assets/footer/gwab.webp"></img><a href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=50022502000614"> 渝公网安备 50022502000614 号</a></div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}

export default Footer;