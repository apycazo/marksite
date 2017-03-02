# Test index (marksite style)
---
Italic text uses simple asterisks, like: *this is italic text on line 1*.  
Bold text uses double asteriks, like: **this is bold text on line 2**.  
Striked-through text uses markers, like ~~this is not right on line 3~~.  
Also, monospaced is between double ticks: ``this is robot talking on line 4``.  
This is some **bold text** and **even more bold, with 1234, and (){}_-**.  
Also, `labels` can be used to `really` remark something.  
Links like [my sample page](http://apycazo.github.io) are supported.  

## Line breaks
---
Line breaks are created using two or more spaces.  
This two lines
are actually rendered together.  

## Code view
This is an example of java code highlighting:  
```java
@Test
public void checkSessionType ()
{
    given()
            // sends auth info without expecting a requirement for it
            .auth().preemptive().basic("gandalf", "the-grey")
            // now the query should go ok
            .when().get("private/service").then().statusCode(HttpStatus.OK.value());

    when().get("private/service").then().statusCode(HttpStatus.UNAUTHORIZED.value());
}
```

## Quoting
---
This are some quoting examples:  
> This is a one line quote

This should be left out

> This is a multiline quote.
> It actually continues!.
> And **by the way**, other markdown `still` works!

## Lists
---
Unordered list:  
* element 1
* element 2
* element 3

Ordered list:
1. element 1
2. element 2
3. element 3

## Lorem ipsum
---
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vehicula risus sapien, ut euismod purus gravida id. Nulla ultricies leo odio, ut euismod augue imperdiet vel. Phasellus quam nisi, elementum dignissim ex sed, ornare semper est. Aliquam luctus risus quis sapien semper, eget rutrum leo bibendum. Donec vel mi at urna posuere porta. Nulla tristique pharetra ex at congue. Nunc non vehicula orci. Donec dignissim arcu commodo eros consectetur commodo.

# Header L1
## Header L2
### Header L3
#### Header L4
