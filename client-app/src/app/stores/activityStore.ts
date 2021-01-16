import { makeAutoObservable, runInAction} from "mobx";
import { SyntheticEvent } from 'react';
import { toast } from "react-toastify";
import { history } from "../..";
import agent from "../api/agent";
import { IActivity } from "../models/activity";
import { RootStore } from "./rootStore";



export default class ActivityStore {

    rootStore: RootStore;

   //observables
    activityRegistray = new Map();
    loadingInitial = false;
    activity: IActivity | null = null;
    submitting = false;
    target = '';

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        makeAutoObservable(this);
    }

    //computed
    get activitiesByDate() {
        return this.groupActivitiesByDate(Array.from(this.activityRegistray.values()));
    }

    // internal function
    groupActivitiesByDate(activities: IActivity[]) {
        const sortedActivities = activities.sort(
            (a, b) => a.date.getTime() - b.date.getTime()
        );

        return Object.entries(sortedActivities.reduce((activities, activity) => {
            const date = activity.date.toISOString().split('T')[0];
            activities[date] = activities[date] ? [...activities[date], activity] : [activity];

            return activities;
        }, {} as {[key: string]: IActivity[]}));
    }

    // actions
    loadActivities = async () => {
        this.loadingInitial = true;
        try {
            const activities = await agent.Activities.list();
            runInAction(() => {
                activities.forEach(activity => {
                    activity.date = new Date(activity.date);
                    this.activityRegistray.set(activity.id,activity);
                });
                
                this.loadingInitial = false;
            });
        } catch (error) {
            runInAction(() => {
                this.loadingInitial = false;
            });
            console.log(error);
        }
    }

    clearActivity = () => {
        this.activity = null;
    }

    loadActivity = async(id: string) => {
        let activity = this.getActivity(id);
        if (activity) {
            this.activity = activity;
            return this.activity;
        } else {
            this.loadingInitial = true;
            try {
                activity = await agent.Activities.details(id);
                runInAction(() => {
                    activity.date = new Date(activity.date);
                    this.activity = activity;
                    this.activityRegistray.set(activity.id,activity);
                    this.loadingInitial = false;
                })
                return activity;
            } catch (error) {
                runInAction(() => {
                    this.loadingInitial = false;
                })
                console.log(error);
            }
        }
    }

    getActivity = (id: string) => {
        return this.activityRegistray.get(id);
    }

    createActivity = async (activity: IActivity) => {
        this.submitting = true;
        try {
            await agent.Activities.create(activity);
            runInAction(() => {
                this.activityRegistray.set(activity.id,activity);
                this.submitting = false;
            });
           history.push(`/activities/${activity.id}`)
            
        } catch (error) {
            
            runInAction(() => {
                this.submitting = false;
            }); 
            toast.error('Problem submitting data');
            console.log(error.response);
        }
    }

    editActivity = async (activity: IActivity) => {
        this.submitting = true;
        try {
            await agent.Activities.update(activity);
            runInAction(() => {
                this.activityRegistray.set(activity.id, activity);
                this.activity = activity;
                this.submitting = false;
            })
            history.push(`/activities/${activity.id}`)
        } catch (error) {
            runInAction(() => {
                this.submitting = false;
            })
            toast.error('Problem submitting data');
            console.log(error.response);
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
            runInAction(() => {
                this.submitting = false;
                this.target = '';
            })
            toast.error('Problem deleting data');
            console.log(error.response);
        }
    }
}