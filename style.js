(function (blink) {
  'use strict';

  var FkAbpStyle = function () {
    blink.theme.styles.basic.apply(this, arguments);
  }

  FkAbpStyle.prototype = {
    parent: blink.theme.styles.basic.prototype,
    bodyClassName: 'content_type_clase_fkabp',
    esIndice: false,
    ckEditorStyles: {
      name: 'fkabp',
      styles: [
        { name: 'Título principal', element: 'h2', attributes: { 'class': 'bck-title1'} },
        { name: 'Título principal 2', element: 'h3', attributes: { 'class': 'bck-title2'} },
        { name: 'Título 1', element: 'h3', attributes: { 'class': 'bck-title3'} },
        { name: 'Título 2', element: 'h3', attributes: { 'class': 'bck-title4'} },
        { name: 'Título 3', element: 'h3', attributes: { 'class': 'bck-title5'} },
        { name: 'Lista Desordenada', element: 'ul', attributes: { 'class': 'bck-ul'} },
        { name: 'Caja simple', type: 'widget', widget: 'blink_box', attributes: { 'class': 'caja-central' } },
        { name: 'Diálogo verde', type: 'widget', widget: 'blink_box', attributes: { 'class': 'dialogo-verde' } },
        { name: 'Diálogo celeste', type: 'widget', widget: 'blink_box', attributes: { 'class': 'dialogo-celeste' } },
        { name: 'Diálogo rojo', type: 'widget', widget: 'blink_box', attributes: { 'class': 'dialogo-rojo' } },
        { name: 'Diálogo amarillo', type: 'widget', widget: 'blink_box', attributes: { 'class': 'dialogo-amarillo' } },
        { name: 'Diálogo verde izq', type: 'widget', widget: 'blink_box', attributes: { 'class': 'dialogo-verde-izq' } },
        { name: 'Diálogo celeste izq', type: 'widget', widget: 'blink_box', attributes: { 'class': 'dialogo-celeste-izq' } },
        { name: 'Diálogo rojo izq', type: 'widget', widget: 'blink_box', attributes: { 'class': 'dialogo-rojo-izq' } },
        { name: 'Diálogo amarillo izq', type: 'widget', widget: 'blink_box', attributes: { 'class': 'dialogo-amarillo-izq' } }
      ]
    },
    init: function (scope) {
      var that = scope || this;
      this.parent.init.call(that);
      that.activityInitialized = true;
      that.getActualUnitActivities();
      that.preventTouchCarousel();
      that.removeFinalSlide();
      blink.activity.navigateBetweenActivities();

    },
    preventTouchCarousel: function () {
      if (this.esIndice) {
        $('#swipeview-slider').on('touchstart', function (event) {
          event.stopPropagation();
          event.stopImmediatePropagation();
          return;
        });
      }
    },

    /**
     * Cierra el iframe de una actividad flipped.
     */
    closeIframe: function () {
      if (parent) {
        parent.cerrarIframe();
      }
    },

    /**
     * @summary Gets the activity type subunits of the actual unit.
     * @return {Object} Object of the actual unit filtering the not activity type subunits
     */
    getActualUnitActivities: function () {
      var curso = blink.getCourse(idcurso),
        that = this,
        units,
        unitSubunits = [],
        actualActivity,
        unitActivities = [];

      curso.done(function () {
        units = curso.responseJSON.units;

      // BK-20801
      for(var i in units){
        for(var j in units[i].subunits){
          if (units[i].subunits[j].id == blink.activity.id){
            unitSubunits = units[i].subunits.concat(units[i].resources);
          }
        }
      }

            // BK-21327
            actualActivity = unitSubunits.find(function(temporalSubunit){
              return temporalSubunit.id == idclase;
            });

            if ( actualActivity != undefined && actualActivity.level == '6') {
              unitActivities.push(actualActivity);
            } else {
              unitActivities = _.filter(unitSubunits, function (subunit) {
                return subunit.type == 'actividad' && subunit.level !== '6';
              });
            }

            that.subunits = unitActivities;
      }).done(function () {
        blink.events.trigger('course_loaded');
      });
    },

    removeFinalSlide: function (scope) {
      var that = scope || this;
      this.parent.removeFinalSlide.call(that, true);
    },
    showBookIndexInClass: function () {
      return true;
    },
    onCourseDataLoaded: function (data) {
      fkabpApp.config.bookcover = fkabpApp.getCover(data);
      var isBookCover = idclase.toString() === fkabpApp.config.bookcover.id;

      if (isBookCover) {
        this.loadUserData();
        $('html').addClass('fkabp-isBookCover');
        var updateHash = false;
        fkabpApp.loadHomepage(data, updateHash);
        this.esPortada = true; //BK-18213 - 4: MODO EDITAR DESDE ACTIVIDAD PORTADA
      } else {
        $('html').removeClass('fkabp-isBookCover').addClass('htmlReady');
        fkabpApp.loadSliders(data);
      }
    },
    loadUserData: function () {
      var urlSeguimiento = '/include/javascript/seguimientoCurso.js.php?idcurso=' + idcurso;
      loadScript(urlSeguimiento, true, (function (data) {
        window.actividades = actividades;
      }).bind(this));
    },
    /**
     * Añadimos hash para que al volver de una actividad vaya a la sección a la que pertenece (alumno o profesor)
     */
    processHash: function () {
      var hash = '',
        curso = blink.getCourse(idcurso),
        tema = '',
        actividad = '';

      if (typeof curso === 'undefined' || typeof curso.responseJSON === 'undefined' || typeof curso.responseJSON.units === 'undefined' || curso.responseJSON.units.length <= 0) {
        return '';
      }

      _.find(curso.responseJSON.units, function (unit) {
        _.find(unit.subunits, function (subunit) {
          if (subunit.id == window.idclase) {
            actividad = subunit;
            tema = unit;
            return
          }
        })
        if (actividad === '') {
          _.find(unit.resources, function (resource) {
            if (resource.id == window.idclase) {
              actividad = resource;
              tema = unit;
              return
            }
          })
        }
        if (typeof window.idtema !== 'undefined' && window.idtema !== '' && unit.id == window.idtema) {
          tema = unit;
          return;
        }
      });

      if (typeof tema === 'undefined' || typeof tema.number === 'undefined' || tema.number - 1 <= 0) {
        return '#home';
      }

      if (typeof actividad.onlyVisibleTeachers !== 'undefined' && actividad.onlyVisibleTeachers) {
        hash = '#unit_' + parseInt(tema.number - 1) + '_teacherarea';
      } else {
        hash = '#unit_' + parseInt(tema.number - 1) + '_studentarea';
      }

      return hash;
    },

    customTargetLink: function (obj) {
      //targetBlank porque el modo fullscreen  se pierde en offline
      var target = {
        'url': 'targetBlank',
        'archivo': 'targetBlank'
      }

      return target;
    },
    isIndexActivity: function (params, code) {
      var navigationCode;
      if (this.esPortada) {
        navigationCode = 2;
      } else {
        navigationCode = code;
      }
      cambiarVisualizacion(true, params, navigationCode);
    }
  };


  FkAbpStyle.prototype = _.extend({}, new blink.theme.styles.basic(), FkAbpStyle.prototype);

  blink.theme.styles['fk_aprendizaje_basado_en_proyectos'] = FkAbpStyle;

  blink.events.on('digitalbook:bpdfloaded', function () {
    // Ejemplo carga de datos del curso desde un libro digital.
    blink.getCourse(idcurso).done(function (data) {
      var style = new FkAbpStyle;
      style.onCourseDataLoaded(data);
    });
  });
