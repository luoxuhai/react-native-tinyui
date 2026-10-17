import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { createRef, type ComponentRef } from 'react';
import { Image } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import MediaView, { MediaView as NamedMediaView } from '..';
import NativeMediaView from '../MediaViewNativeComponent';
import type { MediaViewComponent, MediaViewProps } from '../types';
import { assertComponentEnabled } from '../../utils';

jest.mock('../../utils', () => ({ assertComponentEnabled: jest.fn() }));
jest.mock('../MediaViewNativeComponent', () => 'TinyuiMediaView');

const roots: ReactTestRenderer[] = [];

function render(props: MediaViewProps) {
  let root!: ReactTestRenderer;
  act(() => {
    root = create(<MediaView {...props} />);
  });
  roots.push(root);
  return root;
}

afterEach(() => {
  act(() => roots.splice(0).forEach((root) => root.unmount()));
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe('MediaView migration', () => {
  it('resolves bundled assets and preserves the existing default export and sizing mode', () => {
    jest.spyOn(Image, 'resolveAssetSource').mockReturnValue({
      uri: 'file:///sample.avif',
      width: 200,
      height: 100,
      scale: 1,
    });
    const root = render({ source: 42 });

    expect(MediaView).toBe(NamedMediaView);
    expect(assertComponentEnabled).toHaveBeenCalledWith('MediaView');
    expect(Image.resolveAssetSource).toHaveBeenCalledWith(42);
    expect(root.root.findByType(NativeMediaView).props).toMatchObject({
      source: { uri: 'file:///sample.avif' },
      resizeMode: 'contain',
    });
  });

  it('passes URI changes, view props and lifecycle callbacks to the migrated native view', () => {
    const onLoad = jest.fn<NonNullable<MediaViewProps['onLoad']>>();
    const onError = jest.fn<NonNullable<MediaViewProps['onError']>>();
    const root = render({
      source: { uri: 'https://example.com/clip.mp4?token=123' },
      resizeMode: 'cover',
      style: { width: 200, height: 100 },
      accessibilityLabel: 'Preview',
      onLoad,
      onError,
    });
    const props = root.root.findByType(NativeMediaView).props;

    expect(props).toMatchObject({
      source: { uri: 'https://example.com/clip.mp4?token=123' },
      resizeMode: 'cover',
      style: { width: 200, height: 100 },
      accessibilityLabel: 'Preview',
      onLoad,
      onError,
    });
    act(() => {
      root.update(<MediaView source={{ uri: '' }} />);
    });
    expect(root.root.findByType(NativeMediaView).props.source).toEqual({
      uri: '',
    });
  });

  it('forwards the ref to the Fabric view', () => {
    const ref = createRef<ComponentRef<MediaViewComponent>>();
    const nativeView = { measure: jest.fn() };
    let root!: ReactTestRenderer;
    act(() => {
      root = create(
        <MediaView ref={ref} source={{ uri: 'file:///sample.mp4' }} />,
        {
          createNodeMock: () => nativeView,
        }
      );
    });
    roots.push(root);

    expect(ref.current).toBe(nativeView);
  });
});
