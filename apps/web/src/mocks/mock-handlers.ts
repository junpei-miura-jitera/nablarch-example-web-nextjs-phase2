/**
 * mock server 全体の endpoint handler 集約ファイル。
 */

import { authenticationIndexGetHandler } from './handlers/authentication/index/get'
import { authenticationLoginPostHandler } from './handlers/authentication/login/post'
import { authenticationLogoutGetHandler } from './handlers/authentication/logout/get'
import { clientFindGetHandler } from './handlers/client/find/get'
import { industryFindGetHandler } from './handlers/industry/find/get'
import { projectBackToEditGetHandler } from './handlers/project/backToEdit/get'
import { projectBackToNewGetHandler } from './handlers/project/backToNew/get'
import { projectCompleteOfCreateGetHandler } from './handlers/project/completeOfCreate/get'
import { projectCompleteOfDeleteGetHandler } from './handlers/project/completeOfDelete/get'
import { projectCompleteOfUpdateGetHandler } from './handlers/project/completeOfUpdate/get'
import { projectConfirmOfCreatePostHandler } from './handlers/project/confirmOfCreate/post'
import { projectConfirmOfUpdatePostHandler } from './handlers/project/confirmOfUpdate/post'
import { projectCreatePostHandler } from './handlers/project/create/post'
import { projectDeletePostHandler } from './handlers/project/delete/post'
import { projectDownloadGetHandler } from './handlers/project/download/get'
import { projectEditGetHandler } from './handlers/project/edit/get'
import { projectIndexGetHandler } from './handlers/project/index/get'
import { projectListGetHandler } from './handlers/project/list/get'
import { projectNewEntityGetHandler } from './handlers/project/newEntity/get'
import { projectShowGetHandler } from './handlers/project/show/get'
import { projectUpdatePostHandler } from './handlers/project/update/post'
import { projectBulkBackToListGetHandler } from './handlers/projectbulk/backToList/get'
import { projectBulkCompleteOfUpdateGetHandler } from './handlers/projectbulk/completeOfUpdate/get'
import { projectBulkConfirmOfUpdatePostHandler } from './handlers/projectbulk/confirmOfUpdate/post'
import { projectBulkIndexGetHandler } from './handlers/projectbulk/index/get'
import { projectBulkInitializeGetHandler } from './handlers/projectbulk/initialize/get'
import { projectBulkListGetHandler } from './handlers/projectbulk/list/get'
import { projectBulkUpdatePostHandler } from './handlers/projectbulk/update/post'
import { projectUploadIndexGetHandler } from './handlers/projectupload/index/get'
import { projectUploadPostHandler } from './handlers/projectupload/upload/post'

export const mockHandlers = [
  authenticationIndexGetHandler,
  authenticationLoginPostHandler,
  authenticationLogoutGetHandler,
  clientFindGetHandler,
  industryFindGetHandler,
  projectIndexGetHandler,
  projectListGetHandler,
  projectShowGetHandler,
  projectEditGetHandler,
  projectNewEntityGetHandler,
  projectConfirmOfCreatePostHandler,
  projectCreatePostHandler,
  projectCompleteOfCreateGetHandler,
  projectBackToNewGetHandler,
  projectConfirmOfUpdatePostHandler,
  projectBackToEditGetHandler,
  projectUpdatePostHandler,
  projectCompleteOfUpdateGetHandler,
  projectDeletePostHandler,
  projectCompleteOfDeleteGetHandler,
  projectDownloadGetHandler,
  projectBulkIndexGetHandler,
  projectBulkInitializeGetHandler,
  projectBulkListGetHandler,
  projectBulkConfirmOfUpdatePostHandler,
  projectBulkBackToListGetHandler,
  projectBulkUpdatePostHandler,
  projectBulkCompleteOfUpdateGetHandler,
  projectUploadIndexGetHandler,
  projectUploadPostHandler,
]
