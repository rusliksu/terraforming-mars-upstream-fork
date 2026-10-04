
import {Color} from '../Color';
import {PlayerId, GameId, SpectatorId} from '../Types';
import {Phase} from '../Phase';
import {GameOptionsModel} from './GameOptionsModel';
import {CardName} from '../cards/CardName';

export type SimpleGameModel = {
    astraMechanicaReplayTargetExclusions?: ReadonlyArray<CardName>;
    activePlayer: Color;
    id: GameId;
    name: string;
    phase: Phase;
    players: Array<SimplePlayerModel>;
    spectatorId: SpectatorId;
    gameOptions: GameOptionsModel;
    lastSoloGeneration: number;
    expectedPurgeTimeMs: number;
}

type SimplePlayerModel = {
    color: Color;
    id: PlayerId;
    name: string;
}
