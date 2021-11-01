// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;
import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
contract SimpleAuction is ERC721{
    constructor() public ERC721("DART", "ART")  //Initializing ERC721 
  {   
    benefiter=msg.sender;
  }

  mapping(string=>uint) public foundrynumber;
    mapping (string=>address) public foundryowner;
    mapping(uint=>string) public allfoundry;
    mapping(uint=>string) public isonauction;
    mapping(string=>uint) public bigbid;
    mapping(string=>address) public bigbidder;
    mapping (string=>uint) public nfttime;
    mapping(string=>uint) public lefttime;
    mapping(string=>uint) public nftindex;
    mapping(string => mapping(uint => address)) public historyowner;

    
    address public benefiter; // 拍卖的受益人
    uint public timeOfAuctionEnd=0; // 拍卖的结束时间
    uint public number=0;
    address public highestBidder; // 当前的最高出价者
    uint public highestBid; // 当前的最高出价
    uint  public _biddingTime = 50;
    mapping(uint => address) public myToken; //记录每次拍卖的最高出价者
    mapping(uint => string) public tokenName; // 记录每次拍卖的物品名
    mapping(address => uint) public pendingReturns; // 记录每个人没有达成交易的投入金额
    mapping(string => mapping(address => uint)) public PendingReturns;
    string public s = "Nothing"; // 当前拍卖的物品名
    uint public x = 0; // 当前的剩余时间
    string public checkn = ""; //查询的拍卖品名
    uint public index = 0; //当前拍卖的序号
    bool public begin = false; // 是否有进行中的拍卖
    
//  struct nft{
//     address  onwer;
//     bool  isonauction;
//     string  name;
//     address  BigBidder;
//     uint  Bigbid;
//     uint index;
// }

    //序号
  
    function Createfoundry(string calldata name_) public{
        
        
        s=name_;
        foundrynumber[name_]=number;
        foundryowner[name_]=msg.sender;
        allfoundry[number]=name_;
        isonauction[number]="no";
        nfttime[name_]=0;
        number++;
        nftindex[name_]=1;
        historyowner[name_][nftindex[name_]]=msg.sender;
    }
   


    function createAuction( string calldata name ,uint bidtime) public returns (bool) {
        uint num=foundrynumber[name];
        //require(isonauction[num] != "yes");
        index ++;
        s = name;
        
        bigbidder[name]=msg.sender;
        bigbid[name]=0;
        nfttime[name]=block.timestamp+bidtime;


        benefiter = msg.sender;
        highestBidder = msg.sender;
        highestBid = 0;
        timeOfAuctionEnd = block.timestamp + bidtime;
        isonauction[num] = "yes";
        changeNow(name);
        return true; 
    }
    //更新当前拍卖品状态
    function changeNow(string memory name) public {
        if(block.timestamp > nfttime[name] ) {
            lefttime[name] = 0; 
        }
        else{
        lefttime[name] = nfttime[name]  - block.timestamp;
        } 
    }
    // 出价，当小于当前最高时不成立，当被超过时记录数据，等待被用户主动取回
    function bid(string calldata name) public payable {
        require(block.timestamp <= nfttime[name]);
        // 如果出价不够，交易撤回
        require(msg.value > bigbid[name]);
        if (bigbid[name] != 0) {
            payable(bigbidder[name]).transfer(bigbid[name]);
        PendingReturns[name][msg.sender] += bigbid[name]; 
        }
        bigbidder[name] = msg.sender;
        bigbid[name] = msg.value;
        
    }
    // 取回被超出的拍卖前的出资
    function withdraw(string calldata name) public returns (bool) {
        uint amount = PendingReturns[name][msg.sender];
        require(amount > 0);
        if (amount > 0) {
        pendingReturns[msg.sender] = 0;
        if (!payable(msg.sender).send(amount)) {
        pendingReturns[msg.sender] = amount;
        return false; }
        }
        return true; 
    }
    function AuctionEnd(string calldata name) public {
        require(block.timestamp  >= timeOfAuctionEnd);
        require(bigbidder[name] == msg.sender);
        payable(foundryowner[name]).transfer(bigbid[name]); 
        foundryowner[name]=msg.sender;
        isonauction[foundrynumber[name]]="no";
        if(historyowner[name][nftindex[name]]!=msg.sender){
            nftindex[name]++;
            historyowner[name][nftindex[name]]=msg.sender;
        }
        tokenName[index] = s;
        myToken[index] = highestBidder;
        s = "Nothing";
        highestBid = 0;
    }
}
