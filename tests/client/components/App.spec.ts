import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '@tests/client/components/getLocalVue';
import App from '@/client/components/App.vue';
import {fakePlayerViewModel} from './testHelpers';
import {defineComponent, nextTick, onMounted, onUnmounted} from 'vue';

describe('App', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    window.history.replaceState({}, '', '/');
  });

  it('mounts without errors', () => {
    const wrapper = shallowMount(App, globalConfig);
    expect(wrapper.exists()).to.be.true;
    wrapper.unmount();
  });

  it('updates PlayerHome props without remounting the whole player screen', async () => {
    let mounts = 0;
    let unmounts = 0;
    const PlayerHomeStub = defineComponent({
      props: {
        playerView: {type: Object, required: true},
        viewRevision: {type: Number, default: 0},
      },
      setup() {
        onMounted(() => mounts++);
        onUnmounted(() => unmounts++);
      },
      template: '<div data-test="player-home-stub">{{playerView.runId}}:{{viewRevision}}</div>',
    });
    const wrapper = shallowMount(App, {
      global: {
        ...globalConfig.global,
        stubs: {PlayerHome: PlayerHomeStub},
      },
    });
    wrapper.vm.playerView = fakePlayerViewModel({runId: 'first-run'});
    wrapper.vm.screen = 'player-home';
    await nextTick();

    expect(mounts).eq(1);
    expect(unmounts).eq(0);
    expect(wrapper.find('[data-test="player-home-stub"]').text()).eq('first-run:0');

    window.history.replaceState({}, '', '/player?id=p-blue-id&noredirect');
    global.fetch = (() => Promise.resolve({
      ok: true,
      json: async () => fakePlayerViewModel({runId: 'second-run'}),
    })) as unknown as typeof fetch;
    wrapper.vm.updatePlayer();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await nextTick();

    expect(wrapper.find('[data-test="player-home-stub"]').text()).eq('second-run:1');
    expect(mounts).eq(1);
    expect(unmounts).eq(0);
    wrapper.unmount();
  });
});
