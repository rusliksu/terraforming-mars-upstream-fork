import {shallowMount} from '@vue/test-utils';
import {globalConfig} from '../getLocalVue';
import {expect} from 'chai';
import CreateGameForm from '@/client/components/create/CreateGameForm.vue';

describe('CreateGameForm', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(CreateGameForm, {
      ...globalConfig,
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('serializes one-way 10-card initial draft setting', async () => {
    const wrapper = shallowMount(CreateGameForm, {
      ...globalConfig,
    });
    await wrapper.setData({playersCount: 2, initialDraft: true, initialDraftOneWay: true});
    expect(wrapper.text()).to.contain('10-card one-way initial draft');

    const serialized = await (wrapper.vm as any).serializeSettings();
    const payload = JSON.parse(serialized);

    expect(payload.initialDraft).eq(true);
    expect(payload.initialDraftOneWay).eq(true);
  });
});
