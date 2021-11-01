import React,{ Component } from "react";
import SimpleAuction from "./contracts/SimpleAuction.json";
import getWeb3 from "./getWeb3";
import 'antd/dist/antd.css';
import { Input,Button,Menu,notification,Layout ,Table, Space} from 'antd';
import "./App.css";
import Background from './oriental.png';
const { Header, Content } = Layout;







class App extends Component {


  

  
  constructor(){
    super()
    this.state={
      balance:0,
      nowbalance:0,
      nowaccount:null,
      price:0,
      highestprice:0,
      auctionobjectname:null,
      web3: null, 
      accounts: null, 
      contract: null ,
      namenumber:0,
      instance:null,
      data:null,
      data2:null,
      columns2:null,
      columns:null,
      bidtime:null,
    }
  }
   componentDidMount = async () => {

    const columns = [
      {
        align:'center',
        title: 'NFTindex',
        dataIndex: 'NFTindex',
        key: 'NFTindex',
        width:'100px'
      },
      {
        align:'center',
        title: 'AuctionName',
        dataIndex: 'AuctionName',
        key: 'AuctionName',
        width:'90px'
        
      },
      {
        align:'center',
        title: 'AuctionOwner',
        dataIndex: 'AuctionOwner',
        key: 'AuctionOwner',
        ellipsis: true,
        width:'150px'
      },
      
      {
        align:'center',
        title: 'HighestBidNow(ETH)',
        dataIndex:'HighestBidNow',
        key: 'HighestBidNow',
        width:'85px'
      },
      {
        align:'center',
        title: 'HighestBidder',
        dataIndex:'HighestBidder',
        key: 'HighestBidder',
        ellipsis: true,
        width:'150px'
      },
      {
        align:'center',
        title: '拍卖截止时间',
        dataIndex:'lefttime',
        key: 'lefttime',
        width:'130px'
      },
      {
        align:'center',
        title: 'Action',
        key: 'action',
        render: (text, record) => (
          <Space size="middle" >
            <input placeholder="请输入您的竞价" onChange={(e)=>this.confirmprice(e)}/>
            <Button onClick={() => this.bid(record.AuctionName,record.HighestBidNow)}>发起竞价</Button>
            <Button onClick={() => this.openNotification(record.AuctionName)}>查看以往拥有人</Button>
            <Button onClick={() => this.endbid(record.AuctionName,record.HighestBidder)}>最高出价者确定结束</Button>
          </Space>
        ),
        
        
      },
    ];



    const columns2=[
      {
        align:'center',
        title: 'NFTindex',
        dataIndex: 'NFTindex',
        key: 'NFTindex',
      },
      {
        align:'center',
        title: 'NFTname',
        dataIndex: 'MyNFTname',
        key: 'MyNFTname',
      },
      {
        align:'center',
        title: 'NFTowner',
        dataIndex: 'NFTowner',
        key: 'NFTowner',
      },
      {
        align:'center',
        title: '是否正在拍卖',
        dataIndex: 'isonauction',
        key: 'isonauction',
      },
      {
        title: 'Action',
        key: 'action',
        render: (text, record) => (
          <Space size="middle">
            <Input placeholder="请输入拍卖的持续时间(秒)" style={{width:200}}   onChange={(e)=>this.confirmbidtime(e)} />
            <Button onClick={() => this.beginAuction(record.MyNFTname,record.NFTowner,this.state.bidtime,record.isonauction)}>发起拍卖</Button>
          </Space>
        ),
      },
    ]
this.setState({
  columns:columns,
  columns2:columns2
})

     try {
       // Get network provider and web3 instance.
       const web3 = await getWeb3();

       // Use web3 to get the user's accounts.
       const accounts = await web3.eth.getAccounts();

       // Get the contract instance.
       const balance0 = await web3.eth.getBalance(accounts[0]);
       const balance1 = await web3.utils.fromWei(balance0, 'ether')
       const networkId = await web3.eth.net.getId();
       const deployedNetwork = SimpleAuction.networks[networkId];
       const instance = new web3.eth.Contract(
         SimpleAuction.abi,
         deployedNetwork && deployedNetwork.address,
       );
       this.setState({web3, accounts,contract: instance ,instance:instance, nowaccount:accounts[0],nowbalance:balance1});
       const data = [
        
      ];
      const totalnft=await instance.methods.number().call();
      
      for(let i=0;i<totalnft;i++){
        const AuctionName=await instance.methods.allfoundry(i).call();
        data.push({
          key:i+1,
          NFTindex: i+1,
          MyNFTname: await instance.methods.allfoundry(i).call(),
          NFTowner:await instance.methods.foundryowner(AuctionName).call(),
          isonauction:await instance.methods.isonauction(i).call(),
          
        })
      }
      this.setState({data:data});
      console.log(instance);
      const data2=[];
      for(let i=0;i<totalnft;i++){
        
        if(await instance.methods.isonauction(i).call()=="yes"){
            const AuctionName=await instance.methods.allfoundry(i).call();
            var d = new Date((await instance.methods.nfttime(AuctionName).call())*1000);
            data2.push({
              key:i+1,
              NFTindex: i+1,
              AuctionName:await instance.methods.allfoundry(i).call(),
              AuctionOwner:await instance.methods.foundryowner(AuctionName).call(),
              HighestBidNow:web3.utils.fromWei(await instance.methods.bigbid(AuctionName).call(), 'ether'),
              HighestBidder:await instance.methods.bigbidder(AuctionName).call(),
              lefttime: d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate()+" "+d.getHours() + ":" +d.getMinutes() + ":" +d.getSeconds(),
            })
        }
      }
      this.setState({data2:data2});
      console.log(data2)



     } catch (error) {
       alert(
         `Failed to load web3, accounts, or contract. Check console for details.`,
       );
       console.error(error);
     }
   };
   async  openNotification  (name){
    const {contract,web3,instance,auctionobjectname}=this.state;
    const totalowner=await instance.methods.nftindex(name).call();
    
    let str='';
    for(let i=1;i<=totalowner;i++){
      const address=await instance.methods.historyowner(name,i).call();
      console.log(address);
        str=str.concat("\n","第"+i+"代:"+address);
    }
    console.log(str);
    notification.open({
      message: name+"的历代拥有者",
      description:str.toString(),
      style: {
        width: 450,
      },
    });
  };


   async beginAuction(name,address,bidtime,isonauction){
    const accounts = await this.state.web3.eth.getAccounts();
    if(isonauction==="no"){
      if(address!==accounts[0])
        alert("您不是此NFT的铸造者,无法发起拍卖")
      else{
        if(this.state.bidtime){

        
        const {contract,web3,instance,auctionobjectname}=this.state;
        await contract.methods.createAuction(name,bidtime).send({from:address});
        const data = [
        
        ];
        const totalnft=await instance.methods.number().call();
        
        for(let i=0;i<totalnft;i++){
          const AuctionName=await instance.methods.allfoundry(i).call();
          data.push({
            key:i+1,
            NFTindex: i+1,
            MyNFTname: await instance.methods.allfoundry(i).call(),
            NFTowner:await instance.methods.foundryowner(AuctionName).call(),
            isonauction:await instance.methods.isonauction(i).call(),
          })
        }
        this.setState({data:data});
        const data2=[];
      for(let i=0;i<totalnft;i++){
        if(await instance.methods.isonauction(i).call()=="yes"){
          const AuctionName=await instance.methods.allfoundry(i).call();
          var d = new Date((await instance.methods.nfttime(AuctionName).call())*1000);
          data2.push({
            key:i+1,
            NFTindex: i+1,
            AuctionName:await instance.methods.allfoundry(i).call(),
            AuctionOwner:await instance.methods.foundryowner(AuctionName).call(),
            HighestBidNow:web3.utils.fromWei(await instance.methods.bigbid(AuctionName).call(), 'ether'),
            HighestBidder:await instance.methods.bigbidder(AuctionName).call(),
            lefttime: d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate()+" "+d.getHours() + ":" +d.getMinutes() + ":" +d.getSeconds(),
          })
        }
      }
      
      this.setState({data2:data2});
    }
    else{
      alert("请输入拍卖的持续时间")
    }
    }
  }else{
    alert("该物品已在拍卖中")
  }
      
      
    
   }
   async bid(name,bigbid){
    const {contract,web3,instance}=this.state;
    const accounts = await web3.eth.getAccounts();
    const timestamp = Date.parse(new Date())/1000;
    if(this.state.price>bigbid){
      if(timestamp<await instance.methods.nfttime(name).call()){
        await contract.methods.bid(name).send({
          from:accounts[0],
          value: web3.utils.toWei(this.state.price, 'ether'),
          gas: '3000000',
    
        })
        const totalnft=await instance.methods.number().call();
        const data2=[];
        for(let i=0;i<totalnft;i++){
          if(await instance.methods.isonauction(i).call()=="yes"){
            const AuctionName=await instance.methods.allfoundry(i).call();
            var d = new Date((await instance.methods.nfttime(AuctionName).call())*1000);
            data2.push({
              key:i+1,
              NFTindex: i+1,
              AuctionName:await instance.methods.allfoundry(i).call(),
              AuctionOwner:await instance.methods.foundryowner(AuctionName).call(),
              HighestBidNow:web3.utils.fromWei(await instance.methods.bigbid(AuctionName).call(), 'ether'),
              HighestBidder:await instance.methods.bigbidder(AuctionName).call(),
              lefttime: d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate()+" "+d.getHours() + ":" +d.getMinutes() + ":" +d.getSeconds(),
            })
        }
        }
        this.setState({data2:data2});
      }
      else{
        alert("拍卖时间已截止");
      }
      
    }
    else{
         alert("您发起的价格小于当前最高价,无法参与竞拍")
       }
       
   }
   async endbid(name,address){
    const {contract,web3,instance}=this.state;
    const accounts = await web3.eth.getAccounts();
    const timestamp = Date.parse(new Date())/1000;
    if(timestamp>await instance.methods.nfttime(name).call())
    {
      if(accounts[0]==address){
      await contract.methods.AuctionEnd(name).send({from:accounts[0],})
    window.location.reload()
    }
    else{
      alert("您不是出最高价者,无法确认结束");
    }
    }
    else{
      alert("拍卖时间未截止!");
    }
    
    
   }
   async withdraw(){
    const {contract,web3}=this.state;
    const accounts = await web3.eth.getAccounts();
    await contract.methods.withdraw().send({from:accounts[0]})
    
   }
   async createfoundry(){
     if(this.state.auctionobjectname){
      const {contract,web3,instance}=this.state;
      const accounts = await web3.eth.getAccounts();
      await contract.methods.Createfoundry(this.state.auctionobjectname).send({from:accounts[0]})
      const data=[
      
      ];
      const totalnft=await instance.methods.number().call();
      
      for(let i=0;i<totalnft;i++){
        const AuctionName=await instance.methods.allfoundry(i).call();
        data.push({
          key:i+1,
          NFTindex: i+1,
          MyNFTname: await instance.methods.allfoundry(i).call(),
          NFTowner:await instance.methods.foundryowner(AuctionName).call(),
          isonauction:await instance.methods.isonauction(i).call(),
        })
      }
      console.log(totalnft,data)
   
      this.setState({data:data});
     }
     else{
       alert("请输入拍卖品的名称")
     }
     
   }
   async getnumber(){
    const {instance,accounts}=this.state;
    const totalnft=await instance.methods.number().call();
        const data2=[];
        for(let i=0;i<totalnft;i++){
          if(await instance.methods.isonauction(i).call()=="yes"){
            const AuctionName=await instance.methods.allfoundry(i).call();
            await instance.methods.changeNow(AuctionName).send({
              from:accounts[0]
            });
            var d = new Date((await instance.methods.nfttime(AuctionName).call())*1000);
            data2.push({
              key:i+1,
              NFTindex: i+1,
              AuctionName:await instance.methods.allfoundry(i).call(),
              AuctionOwner:await instance.methods.foundryowner(AuctionName).call(),
              HighestBidNow:await instance.methods.bigbid(AuctionName).call(),
              HighestBidder:await instance.methods.bigbidder(AuctionName).call(),
              lefttime: d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate()+" "+d.getHours() + ":" +d.getMinutes() + ":" +d.getSeconds(),
            })
          }
        }
        this.setState({data2:data2});
 
    
   }
   confirmname(e){
	  this.setState({
      auctionobjectname:e.target.value
	})
   }
   confirmbidtime(e){
	  this.setState({
      bidtime:e.target.value
	})
   }
   confirmprice(e){
     this.setState({
       price:e.target.value
     });
   }
  
  

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    const {instance,web3}=this.state;
   
    //const balance =web3.eth.getBalance(this.state.accounts[0]);
    return (
       
      setTimeout(() => {
        let d = new Date();
    
          this.setState({
            time:d.toString(),
          })
      }, 1000),
      setTimeout(async()=> {
        const {web3,data2}=this.state;
        const account=await this.state.web3.eth.getAccounts();
        const balance0 = await web3.eth.getBalance(account[0]);
        const balance1 = await web3.utils.fromWei(balance0, 'ether')
        
        
          
        
        

        if (account[0] !== this.state.nowaccount) {
          this.setState({
            nowbalance : balance1,
            nowaccount : account[0]
          })
        }
        if(balance1!==this.state.nowbalance){
          this.setState({
            nowbalance:balance1,
          })
        }
      }, 1000),
      <Layout>
      <Header>
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
          <Menu.Item key="1">拍卖市场</Menu.Item>
          <Menu.Item key="2">个人中心</Menu.Item>
          <Menu.Item key="3" disabled="true">当前账户:{this.state.nowaccount}</Menu.Item>
          <Menu.Item key="4" disabled="true">余额:{this.state.nowbalance}ETH</Menu.Item>
        </Menu>
      </Header>
      <Content style={{height:800,backgroundImage: `url(${Background})` }}>
      <h1 style={{textAlign:"center",fontSize:36}}>Welcome to DZY'sAuction!<br/>当前时间{this.state.time}</h1>
      <h1 style={{textAlign:"center"}}>当前正在拍卖</h1>
      {/* <div className="container">
          <h2>当前最高价:{price}<br/>竞拍品:{name}</h2>
          <Input  value={this.state.auctionobjectname} size="large" onChange={(e)=>this.confirmname(e)} />
          <h2>价格</h2>
          <Input placeholder="Basic usage" onChange={(e)=>this.confirmprice(e)} />
          <Button type="primary" onClick={() => this.beginAuction()}>发起拍卖</Button>
          <Button type="primary" onClick={() => this.endbid()}>最高出价者确定结束</Button>
          <Button type="primary" onClick={() => this.bid()}>出价</Button>
          <Button type="primary" onClick={() => this.withdraw()}>取回未交易的金额</Button>
          
          <Button type="primary" onClick={() => this.getnumber()}>查看剩余时间</Button>
          <span>{this.state.namenumber}</span>
      </div> */}
      <Table  columns={this.state.columns} dataSource={this.state.data2}  />
      <h1 style={{textAlign:"center"}}>铸造工厂<br/>
      <Input placeholder="请输入您想要铸造的nft名称" style={{width:220}} value={this.state.auctionobjectname}  onChange={(e)=>this.confirmname(e)} />
      <Button type="primary" danger onClick={() => this.createfoundry()}>铸造一个NFT</Button>
      </h1>
      
      <Table  columns={this.state.columns2} dataSource={this.state.data} />
      </Content>
      
    </Layout>  



      
    );
  }
}

export default App;
