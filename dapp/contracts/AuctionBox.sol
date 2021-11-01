pragma solidity ^0.8.0;
import "./SimpleAuction.sol";
contract AuctionBox{
    SimpleAuction[] public auctions;
    function createauction(string calldata name) public{
        SimpleAuction newauction = new SimpleAuction();
        
        auctions.push(newauction);
    }
    function returnallauctions()view public returns(SimpleAuction[] memory){
        return auctions;
    }
}
