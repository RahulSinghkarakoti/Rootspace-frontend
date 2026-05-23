import { ApiResponse } from "@/types";
import { api } from "./axios";
import { PersonDetail, CreatePersonData } from "@/types/familyTree";

export const personApi={
    createPerson:(treeId:number,personData:CreatePersonData)=>api.post(`/trees/${treeId}/person`,personData),

    getPerson:(treeId:number)=>api.get<ApiResponse<PersonDetail>>(`/person/${treeId}`),

    updatePerson:(personId:string,personData:CreatePersonData)=>api.patch<ApiResponse<PersonDetail>>(`/person/${personId}`,
        personData),
        
    deletePerson:(personId:string)=>api.delete<ApiResponse<void>>(`/person/${personId}`),
}
