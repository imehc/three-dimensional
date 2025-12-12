const oriData = [
  { 'x': 'A计划', 'y': 20 },
  { 'x': 'B计划', 'y': 40 },
  { 'x': 'C计划', 'y': 90 },
  { 'x': 'D计划', 'y': 80 },
  { 'x': 'E计划', 'y': 120 },
  { 'x': 'F计划', 'y': 100 },
  { 'x': 'G计划', 'y': 60 }
];
const [width, height] = [750, 350];

let svg = d3.select('#svg6')
  .attr('width', width)
  .attr('height', height)

let g = svg.append('g')
  .attr('transform', 'translate( 140, 40 )')

//设置饼图的半径
let radius = Math.min(width, height) * 0.8 / 2
console.log(radius)

let arc = d3.arc()
  .innerRadius(70)
  .outerRadius(radius)
  .cornerRadius(10)

// //饼图与文字相连的曲线起点
// let pointStart = d3.arc()
//   .innerRadius(radius)
//   .outerRadius(radius)
// //饼图与文字相连的曲线终点
// let pointEnd = d3.arc()
//   .innerRadius(radius + 20)
//   .outerRadius(radius + 20)

let drawData = d3
  .pie()
  .value(function(d) {
    return d.y
  })
  .sort(null)
  .sortValues(null)
  .startAngle(0)
  .endAngle(Math.PI * 2)
  .padAngle(0.05)(oriData)
console.log(drawData)

let colorScale = d3
  .scaleOrdinal()
  .domain(d3.range(0, oriData.length))
  .range(d3.schemeSet1);
g.append('g')
  .attr('transform', 'translate( ' + radius + ', ' + radius + ' )')
  // .attr('stroke', 'steelblue')
  // .attr('stroke-width', 1)
  .selectAll('path')
  .data(drawData)
  .enter()
  .append('path')
  .attr('fill', function(d) {
    console.log(d,'d.1')
    return colorScale(d.index)
  })
  .attr('d', function(d) {
    console.log(d,'d...')
    d.outerRadius = radius;
    return arc(d)
  })
  .on('mouseover', arcTween(radius + 20, 0))
  .on('mouseout', arcTween(radius, 150))
  .transition()
  .duration(2000)
  .attrTween('d', function (d) {
  //初始加载时的过渡效果
    let fn = d3.interpolate({
      endAngle: d.startAngle
    }, d)
    return function(t) {
      return arc(fn(t))
    }
  })

function arcTween(outerRadius, delay) {
  // 设置缓动函数,为鼠标事件使用
  return function() {
    d3.select(this)
      .transition()
      .delay(delay)
      .attrTween('d', function(d) {
        console.log(d,'d..')
        let i = d3.interpolate(d.outerRadius, outerRadius)
        return function(t) {
          // console.log(t,i,'t..')
          d.outerRadius = i(t)
          return arc(d)
        }
      })
  }
}

//文字层
// let sum = d3.sum(oriData, d => d.y);
// svg.append('g')
//   .attr('transform', 'translate( ' + radius + ', ' + radius + ' )')
//   .selectAll('text')
//   .data(drawData)
//   .enter()
//   .append('text')
//   .attr('transform', function(d) {
//   // arc.centroid(d)将文字平移到弧的中心
//     return 'translate(' + arc.centroid(d) + ') ' +
//       //rotate 使文字旋转扇形夹角一半的位置(也可不旋转)
//       'rotate(' + (-90 + (d.startAngle + (d.endAngle - d.startAngle)/2) * 180 / Math.PI) + ')'
//   })
//   //文字开始点在文字中间
//   .attr('text-anchor', 'middle')
//   //文字垂直居中
//   .attr('dominant-baseline', 'central')
//   .attr('font-size', '10px')
//   //格式化文字显示格式
//   .text(function(d) {
//     return (d.data.y / sum * 100).toFixed(2) + '%';
//   })
  // .attr('rotate', '30') //此设置为设置每个文字中字符的旋转，上面的旋转是以文字为一个整体的旋转

//图例legend
// let legend = g.append('g')
//   .attr('transform', 'translate( ' + radius * 2.5 + ', 0 )')
//   .selectAll('g')
//   .data(drawData)
//   .enter()
//   .append('g')
//   .attr('transform', function(d, i) {
//     return 'translate(0,' + i * 20 + ')'
//   });

// legend
//   .append('rect')
//   .attr('width', 27)
//   .attr('height', 18)
//   .attr('fill', function(d) {
//     return colorScale(d.index)
//   });
// legend
//   .append('text')
//   .text(function(d) {
//     return d.data.x
//   })
//   .style('font-size', 10)
//   .attr('y', '1em')
//   .attr('x', '3em')
//   .attr('dy', 3)

//曲线层
g.append('g')
  .attr('transform', 'translate( ' + radius + ', ' + radius + ' )')
  .selectAll('path')
  .data(drawData)
  .enter()
  .append('path')
  .attr('d',
    d3
      .linkHorizontal()
      .source(function(d) {
        return pointStart.centroid(d)
      })
      .target(function(d) {
        return pointEnd.centroid(d)
      })
  )
  .style('stroke', '#999')
  .style('stroke-width', 1)
  .attr('fill', 'none')

//饼图外面的文字
g.append('g')
  .attr('transform', 'translate( ' + radius + ', ' + radius + ' )')
  .selectAll('path')
  .data(drawData)
  .enter()
  .append('text')
  .text(function(d) {
    return d.data.x
  })
  .attr('x', function(d) {
    return pointEnd.centroid(d)[0]
  })
  .attr('y', function(d) {
    return pointEnd.centroid(d)[1]
  })
  .style('font-size', 10)
  .attr('text-anchor', function(d) {
    if (d.startAngle > Math.PI) {
      return 'end'
    }
  })
  .attr('dominant-baseline', function(d) {
    if (d.index === 4) {
      return 'hanging'
    }
  })



//测试文字
/*svg.append('g')
  .append('text')
  .text('welcome to Beijing')
  .attr('dominant-baseline', 'hanging')
  .attr('transform', 'translate( 30, 30 ) rotate(0)')
  .style('font-style', 'italic')
  .attr('rotate', 12)
  */ 


//测试arc
// let arc = d3.arc()
//   .innerRadius(0)
//   .outerRadius(100)
//   .startAngle(0)
//   .endAngle(Math.PI/2)
//   .cornerRadius(10)
// svg.append('g')
//   .attr('transform', 'translate( 200, 200 )')
//   .append('path')
//   .attr('fill', 'none')
//   .attr('stroke', 'steelblue')
//   .attr('stroke-width', 1.5)
//   .attr('stroke-linejoin', 'round')
//   .attr('stroke-linecap', 'round')
//   .attr('d', arc)

/*//测试transition
svg.append('g')
  .attr('transform', 'translate( 300, 0 )')
  .append('rect')
  .attr("fill","red")
  .attr("x",100)
  .attr("y",100)
  .attr("width",100)
  .attr("height",30)
  .transition()
  .duration(2000)
  .attrTween('width', function(d, i, a) {
    return function(t) {
      return 100 + t * 300
    }
  })*/

