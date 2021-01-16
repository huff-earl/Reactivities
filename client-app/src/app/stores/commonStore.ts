import { makeAutoObservable, reaction } from "mobx";
import { RootStore } from "./rootStore";

export default class CommonStore {
    rootStore: RootStore;
    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        makeAutoObservable(this);

        reaction(
            () => this.token,
            token => {
                if (token) {
                    window.localStorage.setItem('jwt', token);
                } else {
                    window.localStorage.removeItem('jwt')
                }
            }
        )
    }

    //observables
    token: string | null = window.localStorage.getItem('jwt');
    appLoaded = false;

    //actions
    setToken = (token: string | null) => {
        window.localStorage.setItem('jwt', token!);
        this.token = token;
    }

    setAppLoaded = () => {
        this.appLoaded = true;
    }
}