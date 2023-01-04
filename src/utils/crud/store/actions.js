import Vue from 'vue'

const actions = {
  // table data
  getItems ({ commit, getters, dispatch }) {
    commit('setLoadingStatus', true)
    Vue.http.get(getters.path('i') + '.json')
      .then((response) => {
        commit('setItems', response.body)
        commit('setLoadingStatus', false)
      }, (error) => {
        dispatch('openAlertBox', [
          'alertError',
          error.statusText,
        ], { root: true })
      })
  },
  getItemsServerSide ({ commit, getters, dispatch }, [params]) {
    return new Promise((resolve, reject) => {
      commit('setLoadingStatus', true)

      let url = new URLSearchParams(params)
      Vue.http.get(`${getters.path('i')}?${url.toString()}`, {
        headers: {
          Accept: 'application/ld+json',
        },
      })
        .then((response) => {
          commit('setItemsServerSide', response.body)
          resolve()
        }, (error) => {
          dispatch('openAlertBox', [
            'alertError',
            error.statusText,
          ], { root: true })
          reject(error)
        })
    })
  },
  // item details
  getItem ({ commit, getters, dispatch }, [id]) {
    return new Promise((resolve, reject) => {
      commit('setDetailsLoader', true)
      Vue.http.get(`${getters.path('sh')}/${id}.json`)
        .then((response) => {
          commit('setItem', response.body)
          commit('setDetailsLoader', false)
          resolve()
        }, (error) => {
          dispatch('openAlertBox', [
            'alertError',
            error.statusText,
          ], { root: true })
          reject(error)
        })
    })
  },
  updateItem ({
    getters, dispatch,
  }, [
    id,
    params,
    successText,
    errorText,
  ]) {
    return new Promise((resolve, reject) => {
      let _params = params
      Vue.http.put(`${getters.path('u')}/${id}`, _params)
        .then((response) => {
          if (response.status === 200) {
            dispatch('openAlertBox', [
              'alertSuccess',
              successText,
            ], { root: true })
            dispatch('runItemsViewRefreshing')
            resolve(response)
          } else if (response.body.status === 500) {
            dispatch('openAlertBox', [
              'alertError',
              response.body.detail,
            ], { root: true })
          } else if (response.body.status === 400) {
            dispatch('openAlertBox', [
              'alertValidationError',
              response.body.detail,
            ], { root: true })
          }
        }, (error) => {
          dispatch('openAlertBox', [
            'alertError',
            errorText + ' - Reason: ' + error.body.detail,
          ], { root: true })
          reject(error)
        })
    })
  },
  storeItem ({
    commit, state, getters, dispatch,
  }, [
    params,
    successText,
    errorText,
  ]) {
    return new Promise((resolve, reject) => {
      Vue.http.post(getters.path('st'), params)
        .then((response) => {
          if (response.status === 201) {
            dispatch('openAlertBox', [
              'alertSuccess',
              successText,
            ], { root: true })
            dispatch('runItemsViewRefreshing')
            resolve(response)
          } else if (response.body.status === 500) {
            dispatch('openAlertBox', [
              'alertError',
              response.body.msg,
            ], { root: true })
          } else if (response.body.status === 400) {
            dispatch('openAlertBox', [
              'alertValidationError',
              response.body.msg,
            ], { root: true })
          }
          if (state.createdElement.mode === 'inform') {
            console.log('response id', response.body.id)
            commit('setCreatedItemStatus', [
              true,
              response.body.id,
            ])
          }
        }, (error) => {
          dispatch('openAlertBox', [
            'alertError',
            errorText + ' - Reason: ' + error.body.detail,
          ], { root: true })
          reject(error)
        })
    })
  },
  deleteItem ({
    getters, dispatch,
  }, [
    id,
    successText,
    errorText,
  ]) {
    Vue.http.delete(`${getters.path('d')}/${id}`)
      .then(() => {
        dispatch('openAlertBox', [
          'alertSuccess',
          successText,
        ], { root: true })
        dispatch('runItemsViewRefreshing')
      }, (error) => {
        dispatch('openAlertBox', [
          'alertError',
          errorText + ' - Reason: ' + error.body.detail,
        ], { root: true })
      })
  },
  mulitipleItemsUpdate ({
    getters, dispatch,
  }, [
    params,
    successText,
    errorText,
  ]) {
    Vue.http.put(`${getters.path('mu')}/multiple`, params)
      .then(() => {
        dispatch('openAlertBox', [
          'alertSuccess',
          successText,
        ], { root: true })
        dispatch('runItemsViewRefreshing')
      }, (error) => {
        dispatch('openAlertBox', [
          'alertError',
          errorText + ' - Reason: ' + error.body.detail,
        ], { root: true })
      })
  },
  mulitipleItemsDelete ({
    getters, dispatch,
  }, [
    ids,
    successText,
    errorText,
  ]) {
    Vue.http.post(`${getters.path('md')}/multiple-delete`, ids)
      .then(() => {
        dispatch('openAlertBox', [
          'alertSuccess',
          successText,
        ], { root: true })
        dispatch('runItemsViewRefreshing')
      }, (error) => {
        dispatch('openAlertBox', [
          'alertError',
          errorText + ' - Reason: ' + error.body.detail,
        ], { root: true })
      })
  },
  // item elements
  getItemElements ({ commit, state }) {
    const url = state.itemElements.url.replace('{id}', state.itemElements.id)
    Vue.http.get(url)
      .then(response => commit('setItemElements', response.body))
  },
  addItemElement ({
    dispatch, state,
  }, [
    params,
    successText,
    errorText,
  ]) {
    Vue.http.post(state.itemElements.controller, params)
      .then(() => {
        dispatch('openAlertBox', [
          'alertSuccess',
          successText,
        ], { root: true })
        dispatch('getItemElements')
      }, (error) => {
        dispatch('openAlertBox', [
          'alertError',
          errorText + ' - Reason: ' + error.body.detail,
        ], { root: true })
      })
  },
  removeItemElement ({
    dispatch, state,
  }, [
    id,
    successText,
    errorText,
  ]) {
    Vue.http.delete(`${state.itemElements.controller}/${id}`)
      .then(() => {
        dispatch('openAlertBox', [
          'alertSuccess',
          successText,
        ], { root: true })
        dispatch('getItemElements')
      }, () => {
        dispatch('openAlertBox', [
          'alertError',
          errorText,
        ], { root: true })
      })
  },
  addManyItemElements ({
    dispatch, state,
  }, [
    params,
    successText,
    errorText,
  ]) {
    Vue.http.post(`${state.itemElements.controller}/multiple-add`, params)
      .then(() => {
        dispatch('openAlertBox', [
          'alertSuccess',
          successText,
        ], { root: true })
        dispatch('getItemElements')
      }, () => {
        dispatch('openAlertBox', [
          'alertError',
          errorText,
        ], { root: true })
      })
  },
  removeManyItemElements ({
    dispatch, state,
  }, [
    ids,
    successText,
    errorText,
  ]) {
    Vue.http.post(`${state.itemElements.controller}/multiple-delete`, ids)
      .then(() => {
        dispatch('openAlertBox', [
          'alertSuccess',
          successText,
        ], { root: true })
        dispatch('getItemElements')
      }, () => {
        dispatch('openAlertBox', [
          'alertError',
          errorText,
        ], { root: true })
      })
  },
  // extented details
  getItemDetails ({ commit, getters, dispatch }, [id]) {
    return new Promise((resolve, reject) => {
      commit('setDetailsLoader', true)
      Vue.http.get(`${getters.path('sh')}/${id}`)
        .then((response) => {
          commit('itemDetails', response.body)
          commit('setDetailsLoader', false)
          resolve()
        }, (error) => {
          dispatch('openAlertBox', [
            'alertError',
            error.statusText,
          ], { root: true })
          reject(error)
        })
    })
  },
  updateItemDetail ({
    dispatch, state, getters,
  }, [
    id,
    params,
    successText,
  ]) {
    Vue.http.put(`${getters.path('u')}/${id}`, params)
      .then((response) => {
        if (response.body.status === 0) {
          dispatch('openAlertBox', [
            'alertSuccess',
            successText,
          ], { root: true })
        } else if (response.body.status === -1) {
          dispatch('openAlertBox', [
            'alertError',
            response.body.msg,
          ], { root: true })
        } else if (response.body.status === -2) {
          dispatch('openAlertBox', [
            'alertValidationError',
            response.body.msg,
          ], { root: true })
        }
        dispatch('getItemDetails', [state.item[state.itemIdColumn]])
      }, (error) => {
        dispatch('openAlertBox', [
          'alertError',
          error.statusText,
        ], { root: true })
      })
  },
  // child details
  updateChild ({
    dispatch, state,
  }, [
    id,
    params,
    successText,
    path,
  ]) {
    return new Promise((resolve, reject) => {
      Vue.http.put(`${path}/${id}`, params)
        .then((response) => {
          if (response.body.status === 0) {
            dispatch('openAlertBox', [
              'alertSuccess',
              successText,
            ], { root: true })
            resolve()
          } else if (response.body.status === -1) {
            dispatch('openAlertBox', [
              'alertError',
              response.body.msg,
            ], { root: true })
          } else if (response.body.status === -2) {
            dispatch('openAlertBox', [
              'alertValidationError',
              response.body.msg,
            ], { root: true })
          }
          dispatch('getItemDetails', [state.item[state.itemIdColumn]])
        }, (error) => {
          dispatch('openAlertBox', [
            'alertError',
            error.statusText,
          ], { root: true })
          reject(error)
        })
    })
  },
  deleteChild ({
    dispatch, state,
  }, [
    id,
    successText,
    errorText,
    path,
  ]) {
    Vue.http.delete(`${path}/${id}`)
      .then((response) => {
        if (response.body.status === 0) {
          dispatch('openAlertBox', [
            'alertSuccess',
            successText,
          ], { root: true })
        } else if (response.body.status === -1) {
          dispatch('openAlertBox', [
            'alertError',
            response.body.msg,
          ], { root: true })
        } else if (response.body.status === -2) {
          dispatch('openAlertBox', [
            'alertValidationError',
            response.body.msg,
          ], { root: true })
        }
        dispatch('getItemDetails', [state.item[state.itemIdColumn]])
      }, () => {
        dispatch('openAlertBox', [
          'alertError',
          errorText,
        ], { root: true })
      })
  },
  storeChild ({
    dispatch, state,
  }, [
    params,
    successText,
    path,
  ]) {
    return new Promise((resolve, reject) => {
      Vue.http.post(path, params)
        .then((response) => {
          if (response.body.status === 0) {
            dispatch('openAlertBox', [
              'alertSuccess',
              successText,
            ], { root: true })
            resolve()
          } else if (response.body.status === -1) {
            dispatch('openAlertBox', [
              'alertError',
              response.body.msg,
            ], { root: true })
          } else if (response.body.status === -2) {
            dispatch('openAlertBox', [
              'alertValidationError',
              response.body.msg,
            ], { root: true })
          }
          dispatch('getItemDetails', [state.item[state.itemIdColumn]])
        }, (error) => {
          dispatch('openAlertBox', [
            'alertError',
            error.statusText,
          ], { root: true })
          reject(error)
        })
    })
  },
  getChild ({ commit, dispatch }, [
    id,
    path,
    childItemName,
  ]) {
    return new Promise((resolve, reject) => {
      Vue.http.get(`${path}/${id}`)
        .then((response) => {
          commit('setChild', [
            response.body,
            childItemName,
          ])
          resolve()
        }, (error) => {
          dispatch('openAlertBox', [
            'alertError',
            error.statusText,
          ], { root: true })
        })
    })
  },
  runItemsViewRefreshing ({ commit }) {
    commit('refreshTable', true)
    setTimeout(() => {
      commit('refreshTable', false)
    }, 2000)
  },
}

export default actions
