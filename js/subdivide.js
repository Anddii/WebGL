function midPoint(v1, v2){
    let midPoint = [0.5*(v1[0]+v2[0]), 0.5*(v1[1]+v2[1]), 0.5*(v1[2]+v2[2])]
    return midPoint
}

export function subDivide(verticles, indices){
    const newVerticles = []
    const newIndices = []
    // FROM: https://github.com/d3dcoder/d3d12book/blob/master/Common/GeometryGenerator.cpp
    //       v1
    //       *
    //      / \
    //     /   \
    //  m0*-----*m1
    //   / \   / \
    //  /   \ /   \
    // *-----*-----*
    // v0    m2     v2
    var numTris = indices.length/3;
    for(var i = 0; i < numTris; ++i)
      {
      let v0 = verticles[indices[i*3+0]];
          let v1 = verticles[indices[i*3+1]];
      let v2 = verticles[indices[i*3+2]];
      
      let m0 = midPoint(v0, v1);
      let m1 = midPoint(v1, v2);
      let m2 = midPoint(v0, v2);
  
      newVerticles.push(v0)
      newVerticles.push(v1)
      newVerticles.push(v2)
  
      newVerticles.push(m0)
      newVerticles.push(m1)
      newVerticles.push(m2)
      
      newIndices.push(i*6+0);
          newIndices.push(i*6+3);
          newIndices.push(i*6+5);
  
          newIndices.push(i*6+3);
          newIndices.push(i*6+4);
          newIndices.push(i*6+5);
  
          newIndices.push(i*6+5);
          newIndices.push(i*6+4);
          newIndices.push(i*6+2);
  
          newIndices.push(i*6+3);
          newIndices.push(i*6+1);
          newIndices.push(i*6+4);
    }
    return [newVerticles, newIndices]
}