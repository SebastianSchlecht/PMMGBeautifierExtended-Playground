import {PreferenceDao} from "./PreferenceDao.ts";


export interface DaoHolder {
    preferenceDao: PreferenceDao;
}