float wrap(float val, float minVal, float maxVal)
{
  val -= minVal;

  float delta = maxVal - minVal;
  if ( delta < 0.0001 ) return val;

  return val - (delta* floor(val/delta)) + minVal;
}

#pragma glslify: export(wrap)
