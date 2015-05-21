var RadarChart = {
  defaultConfig: {
    containerClass: 'radar-chart',
    w: 600,
    h: 600,
    factor: 0.95,
    factorLegend: 1,
    levels: 3,
    levelTick: false,
    TickLength: 10,
    maxValue: 0,
    radians: 2 * Math.PI,
    color: d3.scale.category10(),
    axisLine: false,
    axisText: true,
    circles: true,
    radius: 5,
    backgroundTooltipColor: "#555",
    backgroundTooltipOpacity: "0.7",
    tooltipColor: "white",
    axisJoin: function(d, i) {
      return d.className || i;
    },
    transitionDuration: 300
  },
  chart: function() {
    // default config
    var cfg = Object.create(RadarChart.defaultConfig);
    var toolip;
    function setTooltip(msg){
      if(msg == false){
        tooltip.classed("visible", 0);
        tooltip.select("rect").classed("visible", 0);
      }else{
        tooltip.classed("visible", 1);
            
            // var x = d3.event.x;
            //     y = d3.event.y;

        var mouseXY = d3.mouse(d3.event.target)

        var x = mouseXY[0],
            y = mouseXY[1];

        tooltip.select("text").classed('visible', 1).style("fill", cfg.tooltipColor);
        var padding=5;
        var bbox = tooltip.select("text").text(msg).node().getBBox();

        tooltip.select("rect")
        .classed('visible', 1).attr("x", 0)
        .attr("x", bbox.x - padding)
        .attr("y", bbox.y - padding)
        .attr("width", bbox.width + (padding*2))
        .attr("height", bbox.height + (padding*2))
        .attr("rx","5").attr("ry","5")
        .style("fill", cfg.backgroundTooltipColor).style("opacity", cfg.backgroundTooltipOpacity);
        tooltip.attr("transform", "translate(" + (x + 10) + "," + (y - 10) + ")")
      }
    }
    function radar(selection) {
      selection.each(function(data) {
        var container = d3.select(this);
        tooltip = container.append("g");
        tooltip.append('rect').classed("tooltip", true);
        tooltip.append('text').classed("tooltip", true);

        // allow simple notation
        data = data.map(function(datum) {
          if(datum instanceof Array) {
            datum = {axes: datum};
          }
          return datum;
        });

        var maxValue = Math.max(cfg.maxValue, d3.max(data, function(d) {
          return d3.max(d.axes, function(o){ return o.value; });
        }));

        var allAxis = data[0].axes.map(function(i, j){ return {name: i.axis, xOffset: (i.xOffset)?i.xOffset:0, yOffset: (i.yOffset)?i.yOffset:0}; });
        var total = allAxis.length;
        var radius = cfg.factor * Math.min(cfg.w / 2, cfg.h / 2);

        container.classed(cfg.containerClass, 1);

        function getPosition(i, range, factor, func){
          factor = typeof factor !== 'undefined' ? factor : 1;
          return range * (1 - factor * func(i * cfg.radians / total));
        }
        function getHorizontalPosition(i, range, factor){
          return getPosition(i, range, factor, Math.sin);
        }
        function getVerticalPosition(i, range, factor){
          return getPosition(i, range, factor, Math.cos);
        }

        // levels && axises
        // var levelFactors = d3.range(0, cfg.levels).map(function(level) {
        //   return radius * ((level + 1) / cfg.levels);
        // });

        // var levelGroups = container.selectAll('g.level-group').data(levelFactors);

        // levelGroups.enter().append('g');
        // levelGroups.exit().remove();

        // levelGroups.attr('class', function(d, i) {
        //   return 'level-group level-group-' + i;
        // });

        // var levelLine = levelGroups.selectAll('.level').data(function(levelFactor) {
        //   return d3.range(0, total).map(function() { return levelFactor; });
        // });

        // levelLine.enter().append('line');
        // levelLine.exit().remove();

        // if (cfg.levelTick){
        //   levelLine
        //   .attr('class', 'level')
        //   .attr('x1', function(levelFactor, i){
        //     if (radius == levelFactor) {
        //       return getHorizontalPosition(i, levelFactor);
        //     } else {
        //       return getHorizontalPosition(i, levelFactor) + (cfg.TickLength / 2) * Math.cos(i * cfg.radians / total);
        //     }
        //   })
        //   .attr('y1', function(levelFactor, i){
        //     if (radius == levelFactor) {
        //       return getVerticalPosition(i, levelFactor);
        //     } else {
        //       return getVerticalPosition(i, levelFactor) - (cfg.TickLength / 2) * Math.sin(i * cfg.radians / total);
        //     }
        //   })
        //   .attr('x2', function(levelFactor, i){
        //     if (radius == levelFactor) {
        //       return getHorizontalPosition(i+1, levelFactor);
        //     } else {
        //       return getHorizontalPosition(i, levelFactor) - (cfg.TickLength / 2) * Math.cos(i * cfg.radians / total);
        //     }
        //   })
        //   .attr('y2', function(levelFactor, i){
        //     if (radius == levelFactor) {
        //       return getVerticalPosition(i+1, levelFactor);
        //     } else {
        //       return getVerticalPosition(i, levelFactor) + (cfg.TickLength / 2) * Math.sin(i * cfg.radians / total);
        //     }
        //   })
        //   .attr('transform', function(levelFactor) {
        //     return 'translate(' + (cfg.w/2-levelFactor) + ', ' + (cfg.h/2-levelFactor) + ')';
        //   });
        // }
        // else{
        //   levelLine
        //   .attr('class', 'level')
        //   .attr('x1', function(levelFactor, i){ return getHorizontalPosition(i, levelFactor); })
        //   .attr('y1', function(levelFactor, i){ return getVerticalPosition(i, levelFactor); })
        //   .attr('x2', function(levelFactor, i){ return getHorizontalPosition(i+1, levelFactor); })
        //   .attr('y2', function(levelFactor, i){ return getVerticalPosition(i+1, levelFactor); })
        //   .attr('transform', function(levelFactor) {
        //     return 'translate(' + (cfg.w/2-levelFactor) + ', ' + (cfg.h/2-levelFactor) + ')';
        //   });
        // }

        

        if(cfg.axisLine || cfg.axisText) {
          var axis = container.selectAll('.axis').data(allAxis);
          console.log(cfg.axisLine);
          var newAxis = axis.enter().append('g');
          if(cfg.axisLine) {
            newAxis.append('line');
          }
          if(cfg.axisText) {
            newAxis.append('text');
          }

          axis.exit().remove();

          axis.attr('class', 'axis');

          if(cfg.axisLine) {
            axis.select('line')
              .attr('x1', cfg.w/2)
              .attr('y1', cfg.h/2)
              .attr('x2', function(d, i) { return getHorizontalPosition(i, cfg.w / 2, cfg.factor); })
              .attr('y2', function(d, i) { return getVerticalPosition(i, cfg.h / 2, cfg.factor); });
          }

          if(cfg.axisText) {
            axis.select('text')
              .attr('class', function(d, i){
                var p = getHorizontalPosition(i, 0.5);

                return 'legend ' +
                  ((p < 0.4) ? 'left' : ((p > 0.6) ? 'right' : 'middle'));
              })
              .attr('dy', function(d, i) {
                var p = getVerticalPosition(i, 0.5);
                return ((p < 0.1) ? '1em' : ((p > 0.9) ? '0' : '0.5em'));
              })
              .text(function(d) { return d.name; })
              .attr('x', function(d, i){ return d.xOffset+ getHorizontalPosition(i, cfg.w/2, cfg.factorLegend); })
              .attr('y', function(d, i){ return d.yOffset+ getVerticalPosition(i, cfg.h/2, cfg.factorLegend); });
          }
        }

        // content
        data.forEach(function(d){
          d.axes.forEach(function(axis, i) {
            axis.x = getHorizontalPosition(i, cfg.w/2, (parseFloat(Math.max(axis.value, 0))/maxValue)*cfg.factor )+ 45;
            axis.y = getVerticalPosition(i, cfg.h/2, (parseFloat(Math.max(axis.value, 0))/maxValue)*cfg.factor )+ 43;
          });
        });
        var polygon = container.selectAll(".area").data(data, cfg.axisJoin);

        polygon.enter().insert("polygon", "#iconohuellasocial")
          .classed({area: 1, 'd3-enter': 1})
          .on('mouseover', function (dd){
            d3.event.stopPropagation();
            container.classed('focus', 1);
            d3.select(this).classed('focused', 1);
            // console.log(dd);
            // setTooltip(dd.className);
          })
          .on('mouseout', function(){
            d3.event.stopPropagation();
            container.classed('focus', 0);
            d3.select(this).classed('focused', 0);
            setTooltip(false);
          });

        polygon.exit()
          .classed('d3-exit', 1) // trigger css transition
          .transition().duration(cfg.transitionDuration)
            .remove();

        polygon
          .each(function(d, i) {
            var classed = {'d3-exit': 0}; // if exiting element is being reused
            classed['radar-chart-serie' + i] = 1;
            if(d.className) {
              classed[d.className] = 1;
            }
            d3.select(this).classed(classed);
          })
          // styles should only be transitioned with css
          // .style('stroke', function(d, i) { return cfg.color(i); })
          // .style('fill', function(d, i) { return cfg.color(i); })
          .style("fill", "url(#socialprint-gradient)")
          .style("mix-blend-mode", "multiply")
          .attr("filter", 'url("#multiply-effect")')
          .transition().duration(cfg.transitionDuration)
            // svg attrs with js
            .attr('points',function(d) {
              return d.axes.map(function(p) {
                return [p.x, p.y].join(',');
              }).join(' ');
            })
            .each('start', function() {
              d3.select(this).classed('d3-enter', 0); // trigger css transition
            });

        if(cfg.circles && cfg.radius) {

          var circleGroups = container.selectAll('g.circle-group').data(data, cfg.axisJoin);

          circleGroups.enter().append('g').classed({'circle-group': 1, 'd3-enter': 1});
          circleGroups.exit()
            .classed('d3-exit', 1) // trigger css transition
            .transition().duration(cfg.transitionDuration).remove();

          circleGroups
            .each(function(d) {
              var classed = {'d3-exit': 0}; // if exiting element is being reused
              if(d.className) {
                classed[d.className] = 1;
              }
              d3.select(this).classed(classed);
            })
            .transition().duration(cfg.transitionDuration)
              .each('start', function() {
                d3.select(this).classed('d3-enter', 0); // trigger css transition
              });

          var circle = circleGroups.selectAll('.circle').data(function(datum, i) {
            return datum.axes.map(function(d) { return [d, i]; });
          });

          circle.enter().append('circle')
            .classed({circle: 1, 'd3-enter': 1})
            .on('mouseover', function(dd){
              d3.event.stopPropagation();
              setTooltip(dd[0].value);
              //container.classed('focus', 1);
              //container.select('.area.radar-chart-serie'+dd[1]).classed('focused', 1);
            })
            .on('mouseout', function(dd){
              d3.event.stopPropagation();
              setTooltip(false);
              container.classed('focus', 0);
              //container.select('.area.radar-chart-serie'+dd[1]).classed('focused', 0);
              //No idea why previous line breaks tooltip hovering area after hoverin point.
            });

          circle.exit()
            .classed('d3-exit', 1) // trigger css transition
            .transition().duration(cfg.transitionDuration).remove();

          circle
            .each(function(d) {
              var classed = {'d3-exit': 0}; // if exit element reused
              classed['radar-chart-serie'+d[1]] = 1;
              d3.select(this).classed(classed);
            })
            // styles should only be transitioned with css
            .style('fill', function(d) { return cfg.color(d[1]); })
            .transition().duration(cfg.transitionDuration)
              // svg attrs with js
              .attr('r', cfg.radius)
              .attr('cx', function(d) {
                return d[0].x;
              })
              .attr('cy', function(d) {
                return d[0].y;
              })
              .each('start', function() {
                d3.select(this).classed('d3-enter', 0); // trigger css transition
              });

          // ensure tooltip is upmost layer
          var tooltipEl = tooltip.node();
          tooltipEl.parentNode.appendChild(tooltipEl);
        }
      });
    }

    radar.config = function(value) {
      if(!arguments.length) {
        return cfg;
      }
      if(arguments.length > 1) {
        cfg[arguments[0]] = arguments[1];
      }
      else {
        d3.entries(value || {}).forEach(function(option) {
          cfg[option.key] = option.value;
        });
      }
      return radar;
    };

    return radar;
  },
  draw: function(id, d, options, containerClass) {
    var chart = RadarChart.chart().config(options);
    var cfg = chart.config();

    if (containerClass) {
       d3.select(containerClass)
        .datum(d)
        .call(chart);
    }
    else {

      d3.select(id).select('svg').remove();
      d3.select(id)
        .append("svg")
        .attr("width", cfg.w)
        .attr("height", cfg.h)
        .datum(d)
        .call(chart);
    }

     
  }
};
// var RadarChart = {
//   defaultConfig: {
//     containerClass: "radar-chart",
//     w: 600,
//     h: 600,
//     factor: .95,
//     factorLegend: 1,
//     levels: 3,
//     circularLevels: !0,
//     levelTick: !1,
//     TickLength: 10,
//     maxValue: 0,
//     radians: 2 * Math.PI,
//     color: d3.scale.category10(),
//     axisLine: !0,
//     axisText: !0,
//     circles: !0,
//     radius: 5,
//     backgroundTooltipColor: "#555",
//     // backgroundTooltipOpacity: "0.7",
//     tooltipColor: "white",
//     axisJoin: function(e, t) {
//       return e.className || t
//     },
//     transitionDuration: 300
//   },
//   chart: function() {
//     function e(e) {
//       if (0 == e) tooltip.classed("visible", 0), tooltip.select("rect").classed("visible", 0);
//       else {
//         tooltip.classed("visible", 1);
//         var t = d3.mouse(d3.event.target),
//           n = t[0],
//           i = t[1];
//         tooltip.select("text").classed("visible", 1).style("fill", r.tooltipColor);
//         var o = 5,
//           a = tooltip.select("text").text(e).node().getBBox();
//         tooltip.select("rect").classed("visible", 1).attr("x", 0).attr("x", a.x - o).attr("y", a.y - o).attr("width", a.width + 2 * o).attr("height", a.height + 2 * o).attr("rx", "5").attr("ry", "5").style("fill", r.backgroundTooltipColor).style("opacity", r.backgroundTooltipOpacity), tooltip.attr("transform", "translate(" + (n + 10) + "," + (i - 10) + ")")
//       }
//     }

//     function t(t) {
//       t.each(function(t) {
//         function n(e, t, n, i) {
//           return n = "undefined" != typeof n ? n : 1, t * (1 - n * i(e * r.radians / l))
//         }

//         function i(e, t, r) {
//           return n(e, t, r, Math.sin)
//         }

//         function o(e, t, r) {
//           return n(e, t, r, Math.cos)
//         }
//         var a = d3.select(this);
//         tooltip = a.append("g"), tooltip.append("rect").classed("tooltip", !0), tooltip.append("text").classed("tooltip", !0), t = t.map(function(e) {
//           return e instanceof Array && (e = {
//             axes: e
//           }), e
//         });
//         var s = Math.max(r.maxValue, d3.max(t, function(e) {
//             return d3.max(e.axes, function(e) {
//               return e.value
//             })
//           })),
//           u = t[0].axes.map(function(e) {
//             return {
//               name: e.axis,
//               xOffset: e.xOffset ? e.xOffset : 0,
//               yOffset: e.yOffset ? e.yOffset : 0
//             }
//           }),
//           l = u.length,
//           c = r.factor * Math.min(r.w / 2, r.h / 2);
//         if (a.classed(r.containerClass, 1), r.circularLevels);
//         else {
//           var h = d3.range(0, r.levels).map(function(e) {
//               return c * ((e + 1) / r.levels)
//             }),
//             f = a.selectAll("g.level-group").data(h);
//           f.enter().append("g"), f.exit().remove(), f.attr("class", function(e, t) {
//             return "level-group level-group-" + t
//           });
//           var d = f.selectAll(".level").data(function(e) {
//             return d3.range(0, l).map(function() {
//               return e
//             })
//           });
//           d.enter().append("line"), d.exit().remove(), r.levelTick ? d.attr("class", "level").attr("x1", function(e, t) {
//             return c == e ? i(t, e) : i(t, e) + r.TickLength / 2 * Math.cos(t * r.radians / l)
//           }).attr("y1", function(e, t) {
//             return c == e ? o(t, e) : o(t, e) - r.TickLength / 2 * Math.sin(t * r.radians / l)
//           }).attr("x2", function(e, t) {
//             return c == e ? i(t + 1, e) : i(t, e) - r.TickLength / 2 * Math.cos(t * r.radians / l)
//           }).attr("y2", function(e, t) {
//             return c == e ? o(t + 1, e) : o(t, e) + r.TickLength / 2 * Math.sin(t * r.radians / l)
//           }).attr("transform", function(e) {
//             return "translate(" + (r.w / 2 - e) + ", " + (r.h / 2 - e) + ")"
//           }) : d.attr("class", "level").attr("x1", function(e, t) {
//             return i(t, e)
//           }).attr("y1", function(e, t) {
//             return o(t, e)
//           }).attr("x2", function(e, t) {
//             return i(t + 1, e)
//           }).attr("y2", function(e, t) {
//             return o(t + 1, e)
//           }).attr("transform", function(e) {
//             return "translate(" + (r.w / 2 - e) + ", " + (r.h / 2 - e) + ")"
//           })
//         }
//         if (r.axisLine || r.axisText) {
//           var p = a.selectAll(".axis").data(u),
//             m = p.enter().append("g");
//           r.axisLine && m.append("line"), r.axisText && m.append("text"), p.exit().remove(), p.attr("class", "axis"), r.axisLine && p.select("line").attr("x1", r.w / 2).attr("y1", r.h / 2).attr("x2", function(e, t) {
//             return i(t, r.w / 2, r.factor)
//           }).attr("y2", function(e, t) {
//             return o(t, r.h / 2, r.factor)
//           }), r.axisText && p.select("text").attr("class", function(e, t) {
//             var r = i(t, .5);
//             return "legend " + (.4 > r ? "left" : r > .6 ? "right" : "middle")
//           }).attr("dy", function(e, t) {
//             var r = o(t, .5);
//             return .1 > r ? "1em" : r > .9 ? "0" : "0.5em"
//           }).text(function(e) {
//             return e.name
//           }).attr("x", function(e, t) {
//             return e.xOffset + i(t, r.w / 2, r.factorLegend)
//           }).attr("y", function(e, t) {
//             return e.yOffset + o(t, r.h / 2, r.factorLegend)
//           })
//         }
//         t.forEach(function(e) {
//           e.axes.forEach(function(e, t) {
//             e.x = i(t, r.w / 2, parseFloat(Math.max(e.value, 0)) / s * r.factor) + 45, e.y = o(t, r.h / 2, parseFloat(Math.max(e.value, 0)) / s * r.factor) + 43
//           })
//         });
//         var v = a.selectAll(".area").data(t, r.axisJoin);
//         if (v.enter().insert("polygon", "#iconohuellasocial").classed({
//             area: 1,
//             "d3-enter": 1
//           }).on("mouseover", function() {
//             d3.event.stopPropagation(), a.classed("focus", 1), d3.select(this).classed("focused", 1)
//           }).on("mouseout", function() {
//             d3.event.stopPropagation(), a.classed("focus", 0), d3.select(this).classed("focused", 0), e(!1)
//           }), v.exit().classed("d3-exit", 1).transition().duration(r.transitionDuration).remove(), v.each(function(e, t) {
//             var r = {
//               "d3-exit": 0
//             };
//             r["radar-chart-serie" + t] = 1, e.className && (r[e.className] = 1), d3.select(this).classed(r)
//           }).style("fill", "url(#socialprint-gradient)").style("mix-blend-mode", "multiply").attr("filter", 'url("#multiply-effect")').transition().duration(r.transitionDuration).attr("points", function(e) {
//             return e.axes.map(function(e) {
//               return [e.x, e.y].join(",")
//             }).join(" ")
//           }).each("start", function() {
//             d3.select(this).classed("d3-enter", 0)
//           }), r.circles && r.radius) {
//           var g = a.selectAll("g.circle-group").data(t, r.axisJoin);
//           g.enter().append("g").classed({
//             "circle-group": 1,
//             "d3-enter": 1
//           }), g.exit().classed("d3-exit", 1).transition().duration(r.transitionDuration).remove(), g.each(function(e) {
//             var t = {
//               "d3-exit": 0
//             };
//             e.className && (t[e.className] = 1), d3.select(this).classed(t)
//           }).transition().duration(r.transitionDuration).each("start", function() {
//             d3.select(this).classed("d3-enter", 0)
//           });
//           var y = g.selectAll(".circle").data(function(e, t) {
//             return e.axes.map(function(e) {
//               return [e, t]
//             })
//           });
//           y.enter().append("circle").classed({
//             circle: 1,
//             "d3-enter": 1
//           }).on("mouseover", function(t) {
//             d3.event.stopPropagation(), e(t[0].value)
//           }).on("mouseout", function() {
//             d3.event.stopPropagation(), e(!1), a.classed("focus", 0)
//           }), y.exit().classed("d3-exit", 1).transition().duration(r.transitionDuration).remove(), y.each(function(e) {
//             var t = {
//               "d3-exit": 0
//             };
//             t["radar-chart-serie" + e[1]] = 1, d3.select(this).classed(t)
//           }).style("fill", function(e) {
//             return r.color(e[1])
//           }).transition().duration(r.transitionDuration).attr("r", r.radius).attr("cx", function(e) {
//             return e[0].x
//           }).attr("cy", function(e) {
//             return e[0].y
//           }).each("start", function() {
//             d3.select(this).classed("d3-enter", 0)
//           });
//           var b = tooltip.node();
//           b.parentNode.appendChild(b)
//         }
//       })
//     }
//     var r = Object.create(RadarChart.defaultConfig);
//     return t.config = function(e) {
//       return arguments.length ? (arguments.length > 1 ? r[arguments[0]] = arguments[1] : d3.entries(e || {}).forEach(function(e) {
//         r[e.key] = e.value
//       }), t) : r
//     }, t
//   },
//   draw: function(e, t, r, n) {
//     var i = RadarChart.chart().config(r),
//       o = i.config();
//     void 0 != n ? d3.select(n).datum(t).call(i) : (d3.select(e).select("svg").remove(), d3.select(e).append("svg").attr("width", o.w).attr("height", o.h).datum(t).call(i))
//   }
// };