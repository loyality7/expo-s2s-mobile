package expo.modules.s2smobile

import com.s2s.mobile.pipeline.ToolDefinition
import com.s2s.mobile.S2SEngine
import io.mockk.mockk
import io.mockk.verify
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

@OptIn(ExperimentalCoroutinesApi::class)
class ToolBridgeTest {

    @Test
    fun `test tool registration and resolution`() = runTest {
        var lastEventName: String? = null
        var lastEventArgs: Map<String, Any?>? = null

        val toolBridge = ToolBridge { eventName, args ->
            lastEventName = eventName
            lastEventArgs = args
        }

        val engine = mockk<S2SEngine>(relaxed = true)
        val definition = ToolDefinition(name = "test_tool", description = "Test", parameters = emptyMap())

        toolBridge.registerTool(engine, definition)
        
        verify { engine.registerTool(eq(definition), any()) }
    }
}
