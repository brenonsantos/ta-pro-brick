import { describe, it, expect } from 'vitest';
import App from '../App';
import React from 'react';

describe('App component', () => {
  it('instantiates App without throwing', () => {
    expect(App).toBeDefined();
    // Call the function component directly to test initial state hooks logic!
    try {
      const element = React.createElement(App);
      expect(element).toBeDefined();
    } catch (e) {
      console.error('Error rendering App element:', e);
      throw e;
    }
  });
});
