import { makeAutoObservable, runInAction} from "mobx";
import { createContext, SyntheticEvent } from 'react';
import agent from "../api/agent";
import { IActivity } from "../models/activity";



class ActivityStore {
   //observables
    activityRegistray = new Map();
    activities: IActivity[] = [];
    loadingInitial = false;
    selectedActivity: IActivity | undefined;
    editMode = false;
    submitting = false;
    target = '';

    constructor() {
        makeAutoObservable(this);
    }

    //computed
    get activitiesByDate() {
        return Array.from(this.activityRegistray.values()).sort(
            (a, b) => Date.parse(a.date) - Date.parse(b.date)
        );
    }

    // actions
    loadActivities = async () => {
        this.loadingInitial = true;
        try {
            const activities = await agent.Activities.list();
            runInAction(() => {
                activities.forEach(activity => {
                    activity.date = activity.date.split('.')[0];
                    this.activityRegistray.set(activity.id,activity);
                });
                
                this.loadingInitial = false;
            })
            
        } catch (error) {
            runInAction(() => {
                this.loadingInitial = false;
            });
            console.log(error);
        }
    }

    createActivity = async (activity: IActivity) => {
        this.submitting = true;
        try {
            await agent.Activities.create(activity);
            runInAction(() => {
                this.activityRegistray.set(activity.id,activity);
                this.editMode = false;
                this.submitting = false;
            });
            
        } catch (error) {
            console.log(error);
            runInAction(() => {
                this.submitting = false;
            }); 
        }
    }

    editActivity = async (activity: IActivity) => {
        this.submitting = true;
        try {
            await agent.Activities.update(activity);
            runInAction(() => {
                this.activityRegistray.set(activity.id, activity);
                this.selectedActivity = activity;
                this.editMode = false;
                this.submitting = false;
            })
            
        } catch (error) {
            console.log(error);
            runInAction(() => {
                this.submitting = false;
            })
            

        }
    }

    deleteActivity = async (event: SyntheticEvent<HTMLButtonElement>, id: string) => {
        this.submitting = true;
        this.target = event.currentTarget.name;
        try {
            await agent.Activities.delete(id);
            runInAction(() => {
                this.activityRegistray.delete(id);
                this.submitting = false;
                this.target = '';
            })
            
        } catch (error) {
            console.log(error);
            runInAction(() => {
                this.submitting = false;
                this.target = '';
            })
            
        }
    }

    openCreateForm = () => {
        this.editMode = true;
        this.selectedActivity = undefined;
    }

    openEditForm = (id: string) => {
        this.selectedActivity = this.activityRegistray.get(id);
        this.editMode = true;
    }

    cancelSelectedActivity = () => {
        this.selectedActivity = undefined;
    }

    cancelFormOpen = () => {
        this.editMode = false;
    }

    selectActivity = (id: string) => {
        this.selectedActivity = this.activityRegistray.get(id);
        this.editMode = false;
    }
}

export default createContext(new ActivityStore())