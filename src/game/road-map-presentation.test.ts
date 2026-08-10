import { describe, expect, it } from 'vitest';
import { ROAD_MAP } from '../domain/road-map';
import {
  getRoadRectangles,
  ROAD_CAMERA_SETTINGS,
} from './road-map-presentation';

describe('road map presentation', () => {
  it('projects every typed road band into world rectangles', () => {
    expect(getRoadRectangles(ROAD_MAP)).toEqual([
      { x: 320, y: 0, width: 96, height: 1280 },
      { x: 928, y: 0, width: 96, height: 1280 },
      { x: 1536, y: 0, width: 96, height: 1280 },
      { x: 0, y: 224, width: 1920, height: 96 },
      { x: 0, y: 608, width: 1920, height: 96 },
      { x: 0, y: 992, width: 1920, height: 96 },
    ]);
  });

  it('keeps the camera at one-to-one scale with smooth follow', () => {
    expect(ROAD_CAMERA_SETTINGS).toEqual({
      zoom: 1,
      lerpX: 0.08,
      lerpY: 0.08,
    });
  });
});
