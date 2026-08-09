import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from './getLocalVue';
import PlayerSetupView from '@/client/components/PlayerSetupView.vue';
import LogPanel from '@/client/components/logpanel/LogPanel.vue';
import {fakePlayerViewModel} from './testHelpers';

describe('PlayerSetupView', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(PlayerSetupView, {
      ...globalConfig,
      props: {
        playerView: fakePlayerViewModel(),
        tileView: 'show',
      },
    });
    expect(wrapper.exists()).to.be.true;
    expect(wrapper.findComponent(LogPanel).exists()).to.be.true;
  });
});
