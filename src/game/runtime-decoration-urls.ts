import type {
  BuildingId,
  EnvironmentAssetId,
} from '../domain/village-layout';
import blacksmithUrl from '../../assets/game/runtime/buildings/blacksmith.png';
import clinicUrl from '../../assets/game/runtime/buildings/clinic.png';
import generalStoreUrl from '../../assets/game/runtime/buildings/general-store.png';
import innUrl from '../../assets/game/runtime/buildings/inn.png';
import playerHouseUrl from '../../assets/game/runtime/buildings/player-house.png';
import ranchStoreUrl from '../../assets/game/runtime/buildings/ranch-store.png';
import bushUrl from '../../assets/game/runtime/environment/bush-spring.png';
import horizontalFenceUrl from '../../assets/game/runtime/environment/fence-horizontal.png';
import pondUrl from '../../assets/game/runtime/environment/pond-spring.png';
import treeUrl from '../../assets/game/runtime/environment/tree-spring.png';
import verticalFenceUrl from '../../assets/game/runtime/environment/fence-vertical.png';

export const RUNTIME_DECORATION_URLS: {
  readonly buildings: Readonly<Record<BuildingId, string>>;
  readonly environment: Readonly<Record<EnvironmentAssetId, string>>;
} = {
  buildings: {
    'player-house': playerHouseUrl,
    'general-store': generalStoreUrl,
    clinic: clinicUrl,
    blacksmith: blacksmithUrl,
    inn: innUrl,
    'ranch-store': ranchStoreUrl,
  },
  environment: {
    'tree-spring': treeUrl,
    'bush-spring': bushUrl,
    'pond-spring': pondUrl,
    'fence-horizontal': horizontalFenceUrl,
    'fence-vertical': verticalFenceUrl,
  },
};
