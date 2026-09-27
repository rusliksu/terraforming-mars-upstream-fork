import {shallowMount} from '@vue/test-utils';
import {globalConfig} from './getLocalVue';
import {expect} from 'chai';
import WaitingFor from '@/client/components/WaitingFor.vue';
import {RecursivePartial} from '@/common/utils/utils';
import {PlayerViewModel, PublicPlayerModel} from '@/common/models/PlayerModel';
import {Phase} from '@/common/Phase';

describe('WaitingFor', () => {
  const thisPlayer: Partial<PublicPlayerModel> = {
    color: 'red',
  } as any;

  const playerView: RecursivePartial<PlayerViewModel> = {
    id: 'p-player-id',
    thisPlayer: thisPlayer as PublicPlayerModel,
    players: [thisPlayer as PublicPlayerModel],
    game: {
      phase: Phase.ACTION,
      gameAge: 1,
      undoCount: 0,
    },
  };

  it('renders player-input-factory when waitingfor is provided', () => {
    const wrapper = shallowMount(WaitingFor, {
      ...globalConfig,
      global: {
        ...globalConfig.global,
        stubs: {
          'PlayerInputFactory': {template: '<div class="stub-pif"></div>'},
        },
      },
      props: {
        playerView: playerView as PlayerViewModel,
        players: [thisPlayer as PublicPlayerModel],
        waitingfor: {
          type: 'option',
          title: 'test',
          buttonLabel: 'save',
        },
      },
    });
    expect(wrapper.find('.stub-pif').exists()).to.be.true;
    expect(wrapper.text()).to.not.include('Not your turn');
  });

  it('shows "not your turn" when waitingfor is undefined', () => {
    const wrapper = shallowMount(WaitingFor, {
      ...globalConfig,
      global: {
        ...globalConfig.global,
        stubs: {
          'PlayerInputFactory': true,
        },
      },
      props: {
        playerView: playerView as PlayerViewModel,
        players: [thisPlayer as PublicPlayerModel],
        waitingfor: undefined,
      },
    });
    expect(wrapper.text()).to.include('Not your turn');
  });

  it('applies an action response through the root player-view contract without cycling screens', () => {
    const wrapper = shallowMount(WaitingFor, {
      ...globalConfig,
      global: {
        ...globalConfig.global,
        stubs: {'PlayerInputFactory': true},
      },
      props: {
        playerView: playerView as PlayerViewModel,
        waitingfor: {
          type: 'option',
          title: 'test',
          buttonLabel: 'save',
        },
      },
    });
    const nextPlayerView = {...playerView, runId: 'next-run'} as PlayerViewModel;
    const root = wrapper.vm.$root as any;
    let applied: PlayerViewModel | undefined;
    root.screen = 'player-home';
    root.viewRevision = 4;
    root.applyPlayerView = (model: PlayerViewModel) => {
      applied = model;
      root.playerView = model;
      root.viewRevision++;
    };

    wrapper.vm.updatePlayerView(nextPlayerView);

    expect(applied).eq(nextPlayerView);
    expect(root.screen).eq('player-home');
    expect(root.viewRevision).eq(5);
    wrapper.unmount();
  });
});
