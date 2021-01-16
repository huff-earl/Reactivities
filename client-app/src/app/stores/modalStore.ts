import { makeAutoObservable, observable } from "mobx";
import { RootStore } from "./rootStore";

export default class ModalStore {
    rootStore: RootStore;
    constructor(rootStore: RootStore) {
        this.rootStore = rootStore
        makeAutoObservable(this);
    }

    //observables
    @observable.shallow modal = {
        open: false,
        body: null
    }

    //actions
    openModal = (content: any) => {
        this.modal.open = true;
        this.modal.body = content;
    }

    closeModal = () => {
        this.modal.open = false;
        this.modal.body = null;
    }
}