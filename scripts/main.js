/**
 * This script interacts with Web-Push library
 * It allows the website to:
 * 1. Check if the browser supports Push Notifications
 * 2. Ask the user to allow Push Notifications
 * 3. Register the ServiceWorker; i.e. sw.js (which listens to the Push Notifications coming from the server)
 * 4. Subscribe the user to Push Notifications and send this subscription to the server (the server uses it to send Push Notifications)
 */
const applicationServerPublicKey = 'BNv_2_DnQwO-p5FQphRsgmAGYcS0Sqpjdl-0JLcKEZrool7Jg29AE5_UO5rcKTo2uTfrdAhX3xMKNuNkJo0d6l4';
var swRegistration = null;

const checkPermissions = async () => {
    if (!('serviceWorker' in navigator))
        throw new Error("serviceWorker is not supported");
    if (!('PushManager' in window))
        throw new Error("PushManager is not supported");
    console.log("Push Notifications are supported in this browser...");
}

const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted')
        throw new Error("Permission is not granted");
    console.log("Push Notifications permission is granted...");
}

const registerServiceWorker = async () => {
    const reg = await navigator.serviceWorker.register('scripts/sw.js');
    // Make sure you update the service worker if already registered:
    reg.update()
    console.log("The service worker is now registerd and updated...");
    return reg;
}

const unregisterServiceWorker = async () => {
    if (swRegistration == null)
        throw new Error("There is no registered service worker...");
    swRegistration.unregister()
        .then((res) => {
            if (res !== true)
                throw new Error("Failed to unregister the Service Worker");
        })
        .catch((error) => {
            console.error("Failed to unregister the Service Worker: " + error);
        });
    console.log("The service worker is now unregisterd...");
    swRegistration = null;
}

function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

const subscribeUser = async () => {
    if (swRegistration == null || swRegistration.pushManager == null)
        throw new Error("You need to register a service worker before subscribing...");
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
    })
    console.log("The user is subscribed:");
    // Send the subscription to the server:
    console.log(JSON.stringify(subscription));
    sendSubscriptionToServer(subscription);
    // Push a *local* notification:
    // Note: this is just a local notification > the other notifications will arrive from the server to sw.js
    swRegistration.showNotification("Thank you for subscribing...");
}

const sendSubscriptionToServer = async (subscription) => {
    console.log("Sending subscription: " + subscription);
    fetch("http://staging-api.geosurf.io:8800/push/notifications/subscription/string", {
        method: "POST",
        body: JSON.stringify(subscription),
        mode: 'no-cors', // TODO: REMOVE THIS
        headers: {
                'Accept': "application/json, text/plain",
                'Content-Type': "application/json;charset=utf-8"
            },
        })
        .then((response) => console.log(response))
        .then((json) => console.log(json));
}

const enableNotificationsAndRegisterTheServiceWorker = async () => {
    checkPermissions();
    await requestNotificationPermission();
    swRegistration = await registerServiceWorker();
}