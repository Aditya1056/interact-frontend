import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();

export const fetchRequest = async ({signal, url, headers={}}) => {

    const response = await fetch(url, {
        method:'GET',
        headers:headers,
        signal:signal
    });

    const responseData = await response.json();

    if(!response.ok){
        const error = new Error(responseData.message || 'Something went wrong. Try again later!');
        throw error;
    }

    return responseData.data;
}

export const postRequest = async ({url, method, body, headers}) => {

    const response = await fetch(url, {
        method:method,
        body:body,
        headers:headers
    });

    const responseData = await response.json();

    if(!response.ok){
        const error = new Error(responseData.message || 'Something went wrong. Try again later!');
        throw error;
    }

    return responseData.data;
}