import Discord from 'discord.js';
import { publicURL, publicTitle } from '../clients';
import {
  formatBidMessageText,
  formatNewGovernanceProposalText,
  formatNewGovernanceVoteText,
  formatProposalAtRiskOfExpiryText,
  formatUpdatedGovernanceProposalStatusText,
  getNounPngBuffer,
} from '../utils';
import { Bid, IAuctionLifecycleHandler, Proposal, Vote } from '../types';

export class DiscordAuctionLifecycleHandler implements IAuctionLifecycleHandler {
  constructor(public readonly discordClients: Discord.WebhookClient[]) {}

  /**
   * Send Discord message with an image of the current noun alerting users
   * @param auctionId The current auction ID
   */
  async handleNewAuction(auctionId: number) {
    const png = await getNounPngBuffer(auctionId.toString());
    if (png) {
      const attachmentName = `Auction-${auctionId}.png`;
      const attachment = new Discord.MessageAttachment(png, attachmentName);
      const message = new Discord.MessageEmbed()
        .setTitle(`New Auction Discovered`)
        .setDescription(`An auction has started for ${publicTitle} #${auctionId}`)
        .setURL(`${publicURL}noun/${auctionId}`)
        .addField(`${publicTitle} ID`, auctionId, true)
        .attachFiles([attachment])
        .setImage(`attachment://${attachmentName}`)
        .setTimestamp();
	console.log(message);
      await Promise.all(this.discordClients.map(c => c.send(message))) .catch(console.log);
    }
    console.log(`processed discord new auction ${auctionId}`);
  }

  /*
   * Send Discord message with new bid event data
   * @param auctionId Noun auction number
   * @param bid Bid amount and ID
   */
  async handleNewBid(auctionId: number, bid: Bid) {
    const message = new Discord.MessageEmbed()
      .setTitle(`New Bid Placed`)
	  .setURL(`${publicURL}noun/${auctionId}`)
      .setDescription(await formatBidMessageText(auctionId, bid))
      .setTimestamp();
      console.log(message);
    await Promise.all(this.discordClients.map(c => c.send(message)));
    console.log(`processed discord new bid ${auctionId}:${bid.id}`);
  }

  async handleNewProposal(proposal: Proposal) {
    const message = new Discord.MessageEmbed()
      .setTitle(`New Governance Proposal`)
      .setURL(`${publicURL}vote/${proposal.id}`)
      .setDescription(formatNewGovernanceProposalText(proposal))
      .setTimestamp();
    await Promise.all(this.discordClients.map(c => c.send(message)));
    console.log(`processed discord new proposal ${proposal.id}`);
  }

  async handleUpdatedProposalStatus(proposal: Proposal) {
    const message = new Discord.MessageEmbed()
      .setTitle(`Proposal Status Update`)
      .setURL(`${publicURL}vote/${proposal.id}`)
      .setDescription(formatUpdatedGovernanceProposalStatusText(proposal))
      .setTimestamp();
    await Promise.all(this.discordClients.map(c => c.send(message)));
    console.log(`processed discord proposal update ${proposal.id}`);
  }

  async handleProposalAtRiskOfExpiry(proposal: Proposal) {
    const message = new Discord.MessageEmbed()
      .setTitle(`Proposal At-Risk of Expiry`)
      .setURL(`${publicURL}vote/${proposal.id}`)
      .setDescription(formatProposalAtRiskOfExpiryText(proposal))
      .setTimestamp();
    await Promise.all(this.discordClients.map(c => c.send(message)));
    console.log(`processed discord proposal expiry warning ${proposal.id}`);
  }

  async handleGovernanceVote(proposal: Proposal, vote: Vote) {
    const message = new Discord.MessageEmbed()
      .setTitle(`New Proposal Vote`)
      .setURL(`${publicURL}vote/${proposal.id}`)
      .setDescription(await formatNewGovernanceVoteText(proposal, vote))
      .setTimestamp();
    await Promise.all(this.discordClients.map(c => c.send(message)));
    console.log(`processed discord new vote for proposal ${proposal.id};${vote.id}`);
  }
  
}
