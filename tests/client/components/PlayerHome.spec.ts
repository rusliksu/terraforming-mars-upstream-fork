import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from './getLocalVue';
import PlayerHome from '@/client/components/PlayerHome.vue';
import {fakePlayerViewModel, fakePublicPlayerModel} from './testHelpers';
import {FakeLocalStorage} from './FakeLocalStorage';
import raw_settings from '@/genfiles/settings.json';
import {defineComponent, nextTick, onMounted, onUnmounted} from 'vue';

describe('PlayerHome', () => {
  let localStorage: FakeLocalStorage;

  beforeEach(() => {
    localStorage = new FakeLocalStorage();
    FakeLocalStorage.register(localStorage);
  });

  afterEach(() => {
    FakeLocalStorage.deregister(localStorage);
  });

  it('mounts without errors', () => {
    const wrapper = shallowMount(PlayerHome, {
      ...globalConfig,
      parentComponent: {
        methods: {
          getVisibilityState: () => true,
          setVisibilityState: () => {},
        },
      } as any,
      props: {
        playerView: fakePlayerViewModel(),
        settings: raw_settings,
        viewRevision: 0,
      },
    });
    expect(wrapper.exists()).to.be.true;
    wrapper.unmount();
  });

  it('remounts only the action input boundary when a new player view arrives', async () => {
    let cardMounts = 0;
    let cardUnmounts = 0;
    let waitingMounts = 0;
    let waitingUnmounts = 0;
    const CardStub = defineComponent({
      props: {card: {type: Object, required: true}},
      setup() {
        onMounted(() => cardMounts++);
        onUnmounted(() => cardUnmounts++);
      },
      template: '<div class="card-stub"></div>',
    });
    const WaitingForStub = defineComponent({
      setup() {
        onMounted(() => waitingMounts++);
        onUnmounted(() => waitingUnmounts++);
      },
      template: '<div class="waiting-stub"></div>',
    });
    const firstPlayer = fakePublicPlayerModel({tableau: [{name: 'CrediCor'}] as any});
    const firstView = fakePlayerViewModel({thisPlayer: firstPlayer, players: [firstPlayer]});
    const wrapper = shallowMount(PlayerHome, {
      ...globalConfig,
      global: {
        ...globalConfig.global,
        stubs: {Card: CardStub, WaitingFor: WaitingForStub},
      },
      parentComponent: {
        methods: {
          getVisibilityState: () => true,
          setVisibilityState: () => {},
        },
      } as any,
      props: {
        playerView: firstView,
        settings: raw_settings,
        viewRevision: 0,
      },
    });
    expect(cardMounts).eq(1);
    expect(waitingMounts).eq(1);

    const secondPlayer = fakePublicPlayerModel({tableau: [{name: 'CrediCor'}] as any, megacredits: 42});
    const secondView = fakePlayerViewModel({thisPlayer: secondPlayer, players: [secondPlayer]});
    await wrapper.setProps({playerView: secondView, viewRevision: 1});
    await nextTick();

    expect(cardMounts).eq(1);
    expect(cardUnmounts).eq(0);
    expect(waitingMounts).eq(2);
    expect(waitingUnmounts).eq(1);
    wrapper.unmount();
  });

  it('remounts the setup action boundary when a new player view arrives', async () => {
    let waitingMounts = 0;
    let waitingUnmounts = 0;
    const WaitingForStub = defineComponent({
      setup() {
        onMounted(() => waitingMounts++);
        onUnmounted(() => waitingUnmounts++);
      },
      template: '<div class="waiting-stub"></div>',
    });
    const firstPlayer = fakePublicPlayerModel({tableau: []});
    const firstView = fakePlayerViewModel({
      thisPlayer: firstPlayer,
      players: [firstPlayer],
      waitingFor: {type: 'option', title: 'Pick a corporation', buttonLabel: 'Save'},
    });
    const wrapper = shallowMount(PlayerHome, {
      ...globalConfig,
      global: {
        ...globalConfig.global,
        stubs: {PlayerSetupView: false, WaitingFor: WaitingForStub},
      },
      parentComponent: {
        methods: {
          getVisibilityState: () => true,
          setVisibilityState: () => {},
        },
      } as any,
      props: {
        playerView: firstView,
        settings: raw_settings,
        viewRevision: 0,
      },
    });
    expect(waitingMounts).eq(1);

    const secondPlayer = fakePublicPlayerModel({tableau: [], megacredits: 42});
    const secondView = fakePlayerViewModel({thisPlayer: secondPlayer, players: [secondPlayer], waitingFor: undefined});
    await wrapper.setProps({playerView: secondView, viewRevision: 1});
    await nextTick();

    expect(waitingMounts).eq(2);
    expect(waitingUnmounts).eq(1);
    wrapper.unmount();
  });
});
