import * as React from 'react';
import { createStore, Plugin, PluginFunctions } from '@react-pdf-viewer/core';

interface StoreProps {
    jumpToPage?(pageIndex: number): void;
}

interface JumpToPagePlugin extends Plugin {
    jumpToPage(pageIndex: number): void;
}

const jumpToPagePlugin = (): JumpToPagePlugin => {
    // @ts-ignore
    const store = React.useMemo(() => createStore<StoreProps>(), []);

    return {
        install: (pluginFunctions: PluginFunctions) => {
            store.update('jumpToPage', pluginFunctions.jumpToPage);
        },
        jumpToPage: (pageIndex: number) => {
            const fn = store.get('jumpToPage');
            if (fn) {
                fn(pageIndex);
            }
        },
    };
};

export default jumpToPagePlugin;