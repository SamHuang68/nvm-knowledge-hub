import {syncReviewedDossiers} from './enrich-patents.mjs';

// 沿用原階段廠商範圍，從已核對的正式資料同步。
syncReviewedDossiers(['ememory','kilopass','sidense','attopsemi']);
