import {Tag} from '../../../common/cards/Tag';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {IActionCard, ICard} from '../ICard';
import {PreludeCard} from '../prelude/PreludeCard';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectOption} from '../../inputs/SelectOption';
import {AndOptions} from '../../inputs/AndOptions';
import {SelectAmount} from '../../inputs/SelectAmount';
import {SelectResource} from '../../inputs/SelectResource';

export class FloatingTradeHub extends PreludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.FLOATING_TRADE_HUB,
      tags: [Tag.SPACE],
      resourceType: CardResource.FLOATER,

      metadata: {
        cardNumber: 'P49',
        renderData: CardRenderer.builder((b) => {
          b.arrow().resource(CardResource.FLOATER, 2).asterix().nbsp.or().br;
          b.text('X').resource(CardResource.FLOATER).arrow().text('X').wild(1).br;

          b.plainText('Action: Add 2 floaters to ANY card, or remove any number of floaters here to gain that many of one standard resource.', /* parens */ true);
        }),
      },
    });
  }

  public canAct(): boolean {
    return true;
  }

  public action(player: IPlayer) {
    const floaterCards = player.getResourceCards(CardResource.FLOATER);
    if (this.resourceCount === 0 && floaterCards.length === 1) {
      this.add2Floaters(player, floaterCards[0]);
      return undefined;
    }
    const add2Floaters = this.add2FloatersOption(player, floaterCards);
    const selectResource = new SelectResource('Select resource to gain');
    const selectAmount = new SelectAmount('Select amount of floaters to remove', undefined, 1, this.resourceCount, true);
    const removeFloaters = new AndOptions(selectAmount, selectResource)
      .setTitle('Convert floaters to standard resources')
      .andThen(() => {
        // TODO(kberg): Add a better log message.
        player.removeResourceFrom(this, selectAmount.selected, {log: true});
        player.stock.add(selectResource.selected, selectAmount.selected, {log: true, from: {card: this}});
        return undefined;
      });
    if (this.resourceCount === 0) {
      return add2Floaters;
    }
    return new OrOptions(add2Floaters, removeFloaters);
  }

  private add2FloatersOption(player: IPlayer, floaterCards: Array<ICard>) {
    if (floaterCards.length === 1) {
      return new SelectOption('Add 2 floaters to Floating Trade Hub', 'Add floaters').andThen(() => {
        this.add2Floaters(player, floaterCards[0]);
        return undefined;
      });
    }
    return new SelectCard('Select card to gain 2 floaters', undefined, floaterCards).andThen(([card]) => {
      this.add2Floaters(player, card);
      return undefined;
    });
  }

  private add2Floaters(player: IPlayer, card: ICard) {
    player.addResourceTo(card, {qty: 2, log: true});
  }
}
