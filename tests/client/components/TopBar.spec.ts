import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from './getLocalVue';
import TopBar from '@/client/components/TopBar.vue';
import {fakePlayerViewModel} from './testHelpers';
import {FakeLocalStorage} from './FakeLocalStorage';

describe('TopBar', () => {
  let localStorage: FakeLocalStorage;

  beforeEach(() => {
    localStorage = new FakeLocalStorage();
    FakeLocalStorage.register(localStorage);
  });

  afterEach(() => {
    FakeLocalStorage.deregister(localStorage);
  });

  it('mounts without errors', () => {
    const wrapper = shallowMount(TopBar, {
      ...globalConfig,
      parentComponent: {
        methods: {
          getVisibilityState: () => true,
          setVisibilityState: () => {},
        },
      } as any,
      props: {
        playerView: fakePlayerViewModel(),
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('renders the terraformed status inside the top bar', () => {
    const playerView = fakePlayerViewModel();
    playerView.game.isTerraformed = true;
    const wrapper = shallowMount(TopBar, {
      ...globalConfig,
      props: {playerView},
    });

    const topBar = wrapper.find('.top-bar');
    expect(topBar.findComponent({name: 'TerraformedBanner'}).exists()).to.be.true;
    expect(wrapper.find('.top-bar-container > terraformed-banner-stub').exists()).to.be.false;
  });

  it('does not render the terraformed status before terraforming is complete', () => {
    const playerView = fakePlayerViewModel();
    playerView.game.isTerraformed = false;
    const wrapper = shallowMount(TopBar, {
      ...globalConfig,
      props: {playerView},
    });

    expect(wrapper.findComponent({name: 'TerraformedBanner'}).exists()).to.be.false;
  });
});
