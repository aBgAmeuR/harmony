import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'event_stream': { paramsTuple?: []; params?: {} }
    'subscribe': { paramsTuple?: []; params?: {} }
    'unsubscribe': { paramsTuple?: []; params?: {} }
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.destroy': { paramsTuple?: []; params?: {} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'uploads.uploads.upload': { paramsTuple?: []; params?: {} }
    'uploads.uploads.stats': { paramsTuple: [ParamValue]; params: {'uploadId': ParamValue} }
    'package.package.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'package.package.stats': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'package.tracks.top': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'package.tracks.get': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'trackId': ParamValue} }
    'package.package.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'event_stream': { paramsTuple?: []; params?: {} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'uploads.uploads.stats': { paramsTuple: [ParamValue]; params: {'uploadId': ParamValue} }
    'package.package.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'package.package.stats': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'package.tracks.top': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'package.tracks.get': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'trackId': ParamValue} }
  }
  HEAD: {
    'event_stream': { paramsTuple?: []; params?: {} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'uploads.uploads.stats': { paramsTuple: [ParamValue]; params: {'uploadId': ParamValue} }
    'package.package.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'package.package.stats': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'package.tracks.top': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'package.tracks.get': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'trackId': ParamValue} }
  }
  POST: {
    'subscribe': { paramsTuple?: []; params?: {} }
    'unsubscribe': { paramsTuple?: []; params?: {} }
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.destroy': { paramsTuple?: []; params?: {} }
    'uploads.uploads.upload': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'package.package.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}