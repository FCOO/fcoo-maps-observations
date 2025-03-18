/****************************************************************************
    fcoo-maps-observations.js,

    (c) 2021, FCOO

    https://github.com/FCOO/fcoo-maps-observations
    https://github.com/FCOO

****************************************************************************/
(function ($, L, window/*, document, undefined*/) {
    "use strict";

    //Create namespaces
    var ns = window.fcoo = window.fcoo || {},
        nsObservations = ns.observations = ns.observations || {},
        nsMap = ns.map = ns.map || {},

        observationId = 'OBSERVATIONS',

        fcooObservationOptions = {
            geoJSONOptions: {
                pane: nsMap.getMarkerPaneName(observationId)
            }
        };

    //createMapLayer = {MAPLAYER_ID: CREATE_MAPLAYER_AND_MENU_FUNCTION} See fcoo-maps/src/map-layer_00.js for description
    nsMap.createMapLayer = nsMap.createMapLayer || {};

    /***********************************************************
    MapLayer_Observations
    Special case for FCOOObservations:
    The geoJSON-layer is always added and "add" and "remove" is done by show/hide the parts of or the hole marker
    ***********************************************************/
    function MapLayer_Observations(options) {
        var obsGroup =  this.observationGroup = options.observationGroup;
        nsMap.MapLayer.call(this, $.extend({
            icon      : obsGroup.options.icon,
            iconClass : obsGroup.options.iconClass,

/*
menuOptions: {
    buttonList: [{
        icon:'fa-map', text:'Text', onClick: () => console.log('Hej'),
class: 'HEJ-MED-DIG', // = (buttonOptions.class || '') + ' ' + _this.showAndHideClasses + '-visibility';
                onlyShowWhenLayer: true
    }]
},
//*/
            legendIcon: obsGroup.faIconPopup,
            text      : obsGroup.name,

            createMarkerPane: true,
            paneId          : observationId,
            minZoom         : 6,

            buttonList: [{
                icon   : 'far fa-message-middle',
                text   : {da: 'Vis', en: 'Show'},
                title  : {da: 'Vis seneste måling for alle synlige lokationer', en: 'Show latest measurement for all visible locations'},
                class  : 'min-width',
                onClick: this._button_onClick_openVisiblePopup,
                context: this,
                onlyShowWhenLayer: true
            },{
                icon   : [['far fa-message-middle', 'far fa-slash']],
                text   : {da: 'Skjul', en: 'Hide'},
                title  : {da: 'Shjul boks for alle synlige lokationer', en: 'Hide box for all visible locations'},
                class  : 'min-width',
                onClick: this._button_onClick_closeVisiblePopup,
                context: this,
                onlyShowWhenLayer: true
            }],

            onAdd: $.proxy(this._onAdd, this)

        }, options));
    }

    nsMap.MapLayer_Observations = MapLayer_Observations;
    MapLayer_Observations.prototype = Object.create(nsMap.MapLayer.prototype);

    $.extend( MapLayer_Observations.prototype, {
        createLayer: function(/* options */){
            //Special case for FCOOObservations: The geoJSON-layer is always added and "add" and "remove" is done by show/hide the parts of or the hole marker
            var geoJSONLayer = this.observationGroup.observations.geoJSON();

            geoJSONLayer.removeFrom = $.proxy(this._removeFrom, this);
            return geoJSONLayer;
        },

        _onAdd: function(map/*, layer*/){
            this.observationGroup.show(map);
        },

        _removeFrom: function(map/*, layer*/){
            //The layer is not removed from the map, but the removed group is hidden
            this.observationGroup.hide(map);
        },


        observations: function(){
            return this.observationGroup.observations;
        },

        openVisiblePopup: function(map){
            this.workingOn();
            this.observations().openVisiblePopup(this.observationGroup.id, map);
            this.workingOff();
        },
        _button_onClick_openVisiblePopup: function(id, selected, $button, map){
            this.openVisiblePopup(map);
        },


        closeVisiblePopup: function(map){
            this.observations().closeVisiblePopup(this.observationGroup.id, map);
        },
        _button_onClick_closeVisiblePopup: function(id, selected, $button, map){
            this.closeVisiblePopup(map);
        },

    });


    /***********************************************************
    Add MapLayer_Observations to createMapLayer
    ***********************************************************/
    nsMap.createMapLayer[observationId] = function(options, addMenu){
        nsObservations.getFCOOObservations( function( fcooObservations ){
            let menuList = [];
            fcooObservations.observationGroupList.forEach(observationGroup => {
                let mapLayer = nsMap._addMapLayer(
                        observationId + '_' + observationGroup.id,
                        nsMap.MapLayer_Observations,
                        {observationGroup: observationGroup}
                    );
                menuList.push( mapLayer.menuItemOptions() );
            });
            addMenu( menuList );
        }, false, fcooObservationOptions);
    };

}(jQuery, L, this, document));